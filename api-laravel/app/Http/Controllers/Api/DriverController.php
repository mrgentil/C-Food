<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderTrackingUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\DriverVerification;
use App\Support\GeoDistance;
use App\Support\OrderPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DriverController extends Controller
{
    /**
     * Orders visible to driver:
     * - Assigned to me: always returned (any location, any city).
     * - Available: same service city + within visible radius of restaurant (when GPS sent).
     */
    public function orders(Request $request)
    {
        $driver = $request->user();

        $validated = $request->validate([
            'city' => 'nullable|string|max:80',
            'mode' => 'nullable|in:available,mine,all',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $mode = $validated['mode'] ?? 'all';
        $serviceCity = $this->resolveServiceCity($driver, $validated['city'] ?? null);
        $driverLat = isset($validated['latitude']) ? (float) $validated['latitude'] : null;
        $driverLng = isset($validated['longitude']) ? (float) $validated['longitude'] : null;
        $visibleRadiusKm = (float) config('delivery.visible_radius_km', 8);

        $q = Order::query()
            ->with(['restaurant', 'address', 'user'])
            ->whereIn('status', ['preparing', 'picked_up', 'delivering']);

        if ($mode === 'available') {
            $q->whereNull('driver_id');
            $this->applyAvailableFilters($q, $serviceCity, $driverLat, $driverLng, $visibleRadiusKm);
        } elseif ($mode === 'mine') {
            $q->where('driver_id', $driver->id);
        } else {
            $q->where(function ($outer) use ($driver, $serviceCity, $driverLat, $driverLng, $visibleRadiusKm) {
                $outer->where('driver_id', $driver->id)
                    ->orWhere(function ($avail) use ($serviceCity, $driverLat, $driverLng, $visibleRadiusKm) {
                        $avail->whereNull('driver_id');
                        $this->applyAvailableFilters($avail, $serviceCity, $driverLat, $driverLng, $visibleRadiusKm);
                    });
            });
        }

        $orders = $q->orderByDesc('created_at')->limit(100)->get();

        return response()->json([
            'meta' => [
                'service_city' => $serviceCity,
                'visible_radius_km' => $visibleRadiusKm,
                'accept_max_radius_km' => (float) config('delivery.accept_max_radius_km', 10),
                'location_filter_active' => $driverLat !== null && $driverLng !== null,
            ],
            'data' => $orders->map(fn (Order $order) => $this->formatOrder($order)),
        ]);
    }

    public function show(Request $request, string $id)
    {
        $driver = $request->user();

        $order = Order::with(['restaurant', 'address', 'user', 'items.menuItem'])
            ->where('driver_id', $driver->id)
            ->findOrFail($id);

        return response()->json([
            'data' => $this->formatOrder($order),
        ]);
    }

    public function accept(Request $request, string $id)
    {
        $driver = $request->user();

        $validated = $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $driverLat = isset($validated['latitude']) ? (float) $validated['latitude'] : null;
        $driverLng = isset($validated['longitude']) ? (float) $validated['longitude'] : null;
        $acceptMaxKm = (float) config('delivery.accept_max_radius_km', 10);

        return DB::transaction(function () use ($driver, $id, $driverLat, $driverLng, $acceptMaxKm) {
            if (! DriverVerification::canOperate($driver)) {
                return response()->json([
                    'message' => 'Compte livreur non vérifié. Impossible d\'accepter une commande.',
                ], 403);
            }

            $order = Order::with('restaurant')->lockForUpdate()->findOrFail($id);

            if (! in_array($order->status, ['preparing', 'picked_up'])) {
                return response()->json(['message' => 'Cette commande ne peut pas être acceptée'], 400);
            }

            if (! empty($order->driver_id) && $order->driver_id !== $driver->id) {
                return response()->json(['message' => 'Commande déjà prise par un autre livreur'], 409);
            }

            $restaurant = $order->restaurant;
            $rLat = $restaurant?->latitude !== null ? (float) $restaurant->latitude : null;
            $rLng = $restaurant?->longitude !== null ? (float) $restaurant->longitude : null;

            if ($rLat !== null && $rLng !== null) {
                if ($driverLat === null || $driverLng === null) {
                    return response()->json([
                        'message' => 'Activez votre position GPS pour accepter cette commande.',
                    ], 422);
                }

                $distanceKm = GeoDistance::km($driverLat, $driverLng, $rLat, $rLng);
                if ($distanceKm !== null && $distanceKm > $acceptMaxKm) {
                    return response()->json([
                        'message' => sprintf(
                            'Vous êtes trop loin du restaurant (%.1f km). Approchez-vous (max %d km).',
                            $distanceKm,
                            (int) round($acceptMaxKm)
                        ),
                    ], 422);
                }
            }

            $order->driver_id = $driver->id;
            if (empty($order->accepted_at)) {
                $order->accepted_at = now();
            }
            $order->save();

            $order = $order->fresh(['restaurant', 'address', 'driver', 'items.menuItem']);
            OrderTrackingUpdated::dispatch($order);

            return response()->json(['message' => 'Commande acceptée', 'data' => $order]);
        });
    }

    public function updateStatus(Request $request, string $id)
    {
        $driver = $request->user();
        $validated = $request->validate([
            'status' => 'required|in:arrived_at_restaurant,picked_up,arrived_at_customer,delivering,delivered',
            'delivery_photo_url' => 'nullable|string|max:500',
            'cash_collected' => 'nullable|boolean',
        ]);

        $order = Order::findOrFail($id);
        if ($order->driver_id !== $driver->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $status = $validated['status'];
        $mapped = match ($status) {
            'arrived_at_restaurant' => $order->status,
            'arrived_at_customer' => 'delivering',
            default => $status,
        };

        $order->status = $mapped;
        if ($mapped === 'preparing' && empty($order->preparing_at)) {
            $order->preparing_at = now();
        }
        if ($mapped === 'picked_up' && empty($order->picked_up_at)) {
            $order->picked_up_at = now();
        }
        if ($mapped === 'delivering' && empty($order->delivering_at)) {
            $order->delivering_at = now();
        }
        if ($mapped === 'delivered' && empty($order->delivered_at)) {
            $order->delivered_at = now();
        }
        if (! empty($validated['delivery_photo_url'])) {
            $order->delivery_photo_url = $validated['delivery_photo_url'];
        }

        if ($mapped === 'delivered') {
            $hasProof = ! empty($order->delivery_photo_url);
            if (! $hasProof) {
                return response()->json([
                    'message' => 'Une photo de preuve de livraison est obligatoire (colis remis au client).',
                    'requires_delivery_photo' => true,
                ], 422);
            }
        }

        if ($mapped === 'delivered' && OrderPayment::requiresCashCollection($order)) {
            if (! $request->boolean('cash_collected')) {
                return response()->json([
                    'message' => 'Confirmez l\'encaissement des espèces avant de clôturer la livraison.',
                    'requires_cash_collection' => true,
                    'amount_due' => (int) ($order->total ?? 0),
                ], 422);
            }
            OrderPayment::markCashCollected($order);
        }

        OrderPayment::syncPaidAt($order);
        $order->save();

        $order = $order->fresh(['restaurant', 'address', 'driver', 'items.menuItem']);
        OrderTrackingUpdated::dispatch($order);

        return response()->json([
            'message' => 'Statut mis à jour',
            'data' => [
                'id' => $order->id,
                'status' => $order->status,
                'delivery_photo_url' => $validated['delivery_photo_url'] ?? null,
            ],
        ]);
    }

    public function updateLocation(Request $request, string $id)
    {
        $driver = $request->user();
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $order = Order::findOrFail($id);
        if ($order->driver_id !== $driver->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $order->driver_latitude = $validated['latitude'];
        $order->driver_longitude = $validated['longitude'];
        $order->last_location_update = now();
        $order->save();

        $fresh = $order->fresh(['restaurant', 'address', 'driver', 'items.menuItem']);

        dispatch(function () use ($fresh) {
            try {
                event(new OrderTrackingUpdated($fresh));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('OrderTrackingUpdated: '.$e->getMessage());
            }
        })->afterResponse();

        return response()->json(['message' => 'Position mise à jour']);
    }

    private function resolveServiceCity($driver, ?string $requestCity): ?string
    {
        $profileCity = trim((string) ($driver->city ?? ''));
        if ($profileCity !== '') {
            return $profileCity;
        }

        $requestCity = trim((string) ($requestCity ?? ''));

        return $requestCity !== '' ? $requestCity : 'Kinshasa';
    }

    private function applyAvailableFilters($query, ?string $serviceCity, ?float $driverLat, ?float $driverLng, float $visibleRadiusKm): void
    {
        if ($serviceCity) {
            $query->whereHas('address', function ($qa) use ($serviceCity) {
                $qa->where('city', $serviceCity);
            });
        }

        if ($driverLat === null || $driverLng === null) {
            return;
        }

        $haversine = GeoDistance::haversineSql('latitude', 'longitude');

        $query->whereHas('restaurant', function ($qr) use ($driverLat, $driverLng, $visibleRadiusKm, $haversine) {
            $qr->where(function ($inner) use ($driverLat, $driverLng, $visibleRadiusKm, $haversine) {
                $inner->where(function ($withCoords) use ($driverLat, $driverLng, $visibleRadiusKm, $haversine) {
                    $withCoords->whereNotNull('latitude')
                        ->whereNotNull('longitude')
                        ->whereRaw("{$haversine} <= ?", [$driverLat, $driverLng, $driverLat, $visibleRadiusKm]);
                })->orWhere(function ($noCoords) {
                    $noCoords->whereNull('latitude')->orWhereNull('longitude');
                });
            });
        });
    }

    private function formatOrder(Order $order): array
    {
        $payment = OrderPayment::summary($order);
        $total = (int) ($order->total ?? 0);

        return [
            'id' => $order->id,
            'status' => $order->status,
            'subtotal' => (int) ($order->subtotal ?? 0),
            'delivery_fee' => (int) ($order->delivery_fee ?? 0),
            'service_fee' => (int) ($order->service_fee ?? 0),
            'discount_amount' => (int) ($order->discount_amount ?? 0),
            'tip' => (int) ($order->tip ?? 0),
            'total' => $total,
            'commission' => (int) round($total * 0.10),
            'created_at' => optional($order->created_at)?->toIso8601String(),
            'delivered_at' => optional($order->delivered_at)?->toIso8601String(),
            'delivery_photo_url' => $order->delivery_photo_url,

            'driver_id' => $order->driver_id,
            'driver_latitude' => $order->driver_latitude,
            'driver_longitude' => $order->driver_longitude,
            'last_location_update' => optional($order->last_location_update)?->toIso8601String(),

            'restaurant' => $order->restaurant ? [
                'id' => $order->restaurant->id,
                'name' => $order->restaurant->name,
                'latitude' => $order->restaurant->latitude,
                'longitude' => $order->restaurant->longitude,
                'address' => $order->restaurant->address,
                'phone' => $order->restaurant->phone,
            ] : null,

            'delivery_address' => $order->address ? [
                'id' => $order->address->id,
                'street' => $order->address->street,
                'city' => $order->address->city,
                'neighborhood' => $order->address->neighborhood,
                'instructions' => $order->address->instructions,
                'latitude' => $order->address->latitude,
                'longitude' => $order->address->longitude,
            ] : null,

            'customer' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'phone' => $order->user->phone,
                'photo' => self::absolutePhotoUrl($order->user->photo),
            ] : null,

            'payment_summary' => $payment,
        ];
    }

    private static function absolutePhotoUrl(?string $photo): ?string
    {
        if ($photo === null || trim($photo) === '') {
            return null;
        }

        if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
            return $photo;
        }

        return url($photo);
    }
}
