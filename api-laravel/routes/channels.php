<?php

use App\Models\Order;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('orders.{orderId}', function ($user, string $orderId) {
    $order = Order::find($orderId);

    if (! $order) {
        return false;
    }

    return (string) $order->user_id === (string) $user->id
        || (string) $order->driver_id === (string) $user->id;
});

Broadcast::channel('driver-orders.{city}', function ($user, string $city) {
    return true; // We can add further checks (e.g., $user->is_driver) if needed
});
