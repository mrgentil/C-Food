<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminDispatchController extends Controller
{
    public function index()
    {
        return view('admin.dispatch');
    }

    public function data()
    {
        $orders = Order::with(['restaurant', 'address', 'driver', 'user'])
            ->whereIn('status', ['preparing', 'picked_up', 'delivering'])
            ->get();

        $dispatchData = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'short_id' => substr($order->id, 0, 8),
                'status' => $order->status,
                'total' => $order->total,
                'restaurant' => [
                    'name' => $order->restaurant->name ?? 'Inconnu',
                    'lat' => $order->restaurant->latitude ?? null,
                    'lng' => $order->restaurant->longitude ?? null,
                ],
                'client' => [
                    'name' => $order->user->name ?? 'Client',
                    'phone' => $order->user->phone ?? '',
                    'lat' => $order->address->latitude ?? null,
                    'lng' => $order->address->longitude ?? null,
                ],
                'driver' => $order->driver ? [
                    'id' => $order->driver->id,
                    'name' => $order->driver->name,
                    'phone' => $order->driver->phone,
                    'lat' => $order->driver_latitude,
                    'lng' => $order->driver_longitude,
                    'last_update' => optional($order->last_location_update)->diffForHumans(),
                ] : null,
            ];
        });

        return response()->json([
            'success' => true,
            'orders' => $dispatchData,
        ]);
    }
}
