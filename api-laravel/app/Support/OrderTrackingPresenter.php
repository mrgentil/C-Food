<?php

namespace App\Support;

use App\Models\Order;

class OrderTrackingPresenter
{
    public static function toArray(Order $order): array
    {
        $order->loadMissing(['items.menuItem', 'restaurant', 'address', 'driver']);

        $estimated = optional($order->estimated_delivery)?->toIso8601String()
            ?? $order->created_at?->copy()->addMinutes(45)->toIso8601String();

        $restaurant = $order->restaurant;
        $address = $order->address;
        $driver = $order->driver;

        $tracking = DeliveryTrackingMetrics::forOrder($order);

        return [
            'id' => $order->id,
            'status' => $order->status,
            'tracking' => $tracking,
            'total' => $order->total,
            'subtotal' => $order->subtotal,
            'delivery_fee' => $order->delivery_fee,
            'service_fee' => $order->service_fee,
            'discount_amount' => $order->discount_amount,
            'tip' => $order->tip,
            'payment_method' => $order->payment_method,
            'transaction_id' => $order->transaction_id,
            'payment_summary' => OrderPayment::summary($order),
            'estimated_delivery' => $estimated,
            'driver_latitude' => $order->driver_latitude,
            'driver_longitude' => $order->driver_longitude,
            'last_location_update' => optional($order->last_location_update)?->toIso8601String(),
            'accepted_at' => optional($order->accepted_at)?->toIso8601String(),
            'preparing_at' => optional($order->preparing_at)?->toIso8601String(),
            'picked_up_at' => optional($order->picked_up_at)?->toIso8601String(),
            'delivering_at' => optional($order->delivering_at)?->toIso8601String(),
            'delivered_at' => optional($order->delivered_at)?->toIso8601String(),
            'delivery_photo_url' => self::photoUrl($order->delivery_photo_url ?? null),
            'review_exists' => (bool) ($order->review_exists ?? false),
            'restaurant' => $restaurant ? [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'image' => self::photoUrl($restaurant->image),
                'address' => $restaurant->address,
                'latitude' => self::toFloat($restaurant->latitude),
                'longitude' => self::toFloat($restaurant->longitude),
            ] : null,
            'address' => $address ? [
                'id' => $address->id,
                'street' => $address->street,
                'city' => $address->city,
                'neighborhood' => $address->neighborhood,
                'instructions' => $address->instructions ?? null,
                'latitude' => self::toFloat($address->latitude),
                'longitude' => self::toFloat($address->longitude),
                'label' => $tracking['delivery_address_label'] ?? null,
            ] : null,
            'driver' => $driver ? [
                'id' => $driver->id,
                'name' => $driver->name,
                'phone' => $driver->phone,
                'photo' => self::photoUrl($driver->photo),
                'rating' => $driver->rating ?? null,
            ] : null,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'menu_item' => $item->menuItem ? [
                    'id' => $item->menuItem->id,
                    'name' => $item->menuItem->name,
                ] : null,
            ])->values()->all(),
        ];
    }

    private static function photoUrl(?string $photo): ?string
    {
        if ($photo === null || trim($photo) === '') {
            return null;
        }

        if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
            return $photo;
        }

        return url($photo);
    }

    private static function toFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }
}
