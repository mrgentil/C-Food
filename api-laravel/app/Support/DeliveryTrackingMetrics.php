<?php

namespace App\Support;

use App\Models\Order;

class DeliveryTrackingMetrics
{
    /** Distance considérée comme « sur place » */
    public const ARRIVAL_RADIUS_M = 80;

    /** Vitesse urbaine moyenne ~30 km/h → 500 m/min */
    public const METERS_PER_MINUTE = 500;

    public static function forOrder(Order $order): array
    {
        $status = (string) $order->status;
        $driverLat = self::toFloat($order->driver_latitude);
        $driverLng = self::toFloat($order->driver_longitude);

        $restaurant = $order->restaurant;
        $address = $order->address;
        $driver = $order->driver;
        $driverName = $driver?->name ? explode(' ', trim($driver->name))[0] : 'Votre livreur';

        $showDriver = ! empty($order->driver_id)
            && in_array($status, ['preparing', 'picked_up', 'delivering'], true);

        if ($driverLat === null || $driverLng === null || ! $showDriver) {
            return [
                'phase' => 'waiting',
                'target' => null,
                'distance_meters' => null,
                'distance_label' => null,
                'eta_minutes' => null,
                'eta_label' => null,
                'proximity' => 'waiting',
                'client_message' => $order->driver_id
                    ? 'Position du livreur en cours de mise à jour…'
                    : 'En attente d\'un livreur',
                'driver_message' => null,
                'show_driver_on_map' => (bool) $order->driver_id,
            ];
        }

        $target = self::resolveTarget($order, $status);
        $distanceM = self::distanceMeters(
            $driverLat,
            $driverLng,
            $target['latitude'],
            $target['longitude']
        );

        $etaMinutes = $distanceM !== null
            ? max(1, (int) ceil($distanceM / self::METERS_PER_MINUTE))
            : null;

        $proximity = self::proximity($distanceM, $etaMinutes);
        $distanceLabel = self::formatDistance($distanceM);
        $etaLabel = $etaMinutes !== null ? "environ {$etaMinutes} min" : null;

        return [
            'phase' => $target['phase'],
            'target' => $target['type'],
            'distance_meters' => $distanceM !== null ? (int) round($distanceM) : null,
            'distance_label' => $distanceLabel,
            'eta_minutes' => $etaMinutes,
            'eta_label' => $etaLabel,
            'proximity' => $proximity,
            'client_message' => self::clientMessage($driverName, $proximity, $etaMinutes, $distanceLabel, $target['phase']),
            'driver_message' => self::driverMessage($proximity, $etaMinutes, $distanceLabel, $target['phase']),
            'show_driver_on_map' => true,
            'delivery_address_label' => $address
                ? trim(implode(', ', array_filter([
                    $address->street,
                    $address->neighborhood,
                    $address->city,
                ])))
                : null,
        ];
    }

    private static function resolveTarget(Order $order, string $status): array
    {
        $restaurant = $order->restaurant;
        $address = $order->address;

        if ($status === 'preparing' && $restaurant) {
            return [
                'type' => 'restaurant',
                'phase' => 'to_restaurant',
                'latitude' => (float) $restaurant->latitude,
                'longitude' => (float) $restaurant->longitude,
            ];
        }

        if ($address && $address->latitude !== null && $address->longitude !== null) {
            $phase = in_array($status, ['picked_up', 'delivering'], true)
                ? 'to_customer'
                : 'to_customer';

            return [
                'type' => 'delivery',
                'phase' => $phase,
                'latitude' => (float) $address->latitude,
                'longitude' => (float) $address->longitude,
            ];
        }

        return [
            'type' => 'delivery',
            'phase' => 'to_customer',
            'latitude' => (float) ($restaurant->latitude ?? -4.3217),
            'longitude' => (float) ($restaurant->longitude ?? 15.3122),
        ];
    }

    private static function proximity(?float $distanceM, ?int $etaMinutes): string
    {
        if ($distanceM !== null && $distanceM <= self::ARRIVAL_RADIUS_M) {
            return 'arrived';
        }
        if ($etaMinutes !== null && $etaMinutes <= 2) {
            return 'near';
        }
        if ($etaMinutes !== null && $etaMinutes <= 10) {
            return 'approaching';
        }

        return 'far';
    }

    private static function clientMessage(
        string $driverName,
        string $proximity,
        ?int $etaMinutes,
        ?string $distanceLabel,
        string $phase
    ): string {
        if ($proximity === 'arrived') {
            return $phase === 'to_restaurant'
                ? "{$driverName} est au restaurant"
                : "{$driverName} est tout près de chez vous";
        }
        if ($proximity === 'near' && $etaMinutes !== null) {
            return "{$driverName} arrive dans environ {$etaMinutes} minute".($etaMinutes > 1 ? 's' : '');
        }
        if ($proximity === 'approaching' && $etaMinutes !== null) {
            return "{$driverName} s'approche — {$distanceLabel}, ~{$etaMinutes} min";
        }
        if ($etaMinutes !== null) {
            return "{$driverName} est en route — environ {$etaMinutes} min";
        }

        return "{$driverName} est en route vers vous";
    }

    private static function driverMessage(
        string $proximity,
        ?int $etaMinutes,
        ?string $distanceLabel,
        string $phase
    ): string {
        if ($proximity === 'arrived') {
            return $phase === 'to_restaurant'
                ? 'Vous êtes au restaurant'
                : 'Vous êtes sur place chez le client';
        }
        if ($etaMinutes !== null) {
            $dest = $phase === 'to_restaurant' ? 'du restaurant' : 'du client';

            return "Environ {$etaMinutes} min {$dest} ({$distanceLabel})";
        }

        return 'Calcul de l\'itinéraire…';
    }

    public static function distanceMeters(float $lat1, float $lon1, float $lat2, float $lon2): ?float
    {
        $R = 6371000;
        $toRad = fn (float $d) => $d * M_PI / 180;
        $dLat = $toRad($lat2 - $lat1);
        $dLon = $toRad($lon2 - $lon1);
        $a = sin($dLat / 2) ** 2
            + cos($toRad($lat1)) * cos($toRad($lat2)) * sin($dLon / 2) ** 2;

        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    public static function formatDistance(?float $meters): ?string
    {
        if ($meters === null) {
            return null;
        }
        if ($meters < 1000) {
            return ((int) round($meters)).' m';
        }

        return round($meters / 1000, 1).' km';
    }

    private static function toFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }
}
