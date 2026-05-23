<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderMessage;
use App\Support\OrderChatHelper;
use App\Support\OrderMessagePresenter;
use Illuminate\Http\Request;

class DriverMessageController extends Controller
{
    private function driverOrderOrFail(Request $request, string $orderId): Order
    {
        $driver = $request->user();

        return Order::where('driver_id', $driver->id)->findOrFail($orderId);
    }

    public function index(Request $request, string $orderId)
    {
        $order = $this->driverOrderOrFail($request, $orderId);

        $messages = OrderMessage::where('order_id', $order->id)
            ->with(['user:id,name,photo'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn (OrderMessage $m) => OrderMessagePresenter::toArray($m));

        return response()->json(['data' => $messages]);
    }

    public function store(Request $request, string $orderId)
    {
        $order = $this->driverOrderOrFail($request, $orderId);
        $driver = $request->user();

        $validated = $request->validate([
            'message' => 'nullable|string|max:2000',
            'type' => 'nullable|string|in:text,image,video,audio,link',
            'media_url' => 'nullable|url|max:2048',
            'media_meta' => 'nullable|array',
        ]);

        if (empty($validated['message'] ?? null) && empty($validated['media_url'] ?? null)) {
            return response()->json(['message' => 'Message ou média requis.'], 422);
        }

        $msg = OrderChatHelper::create($order, $driver, 'driver', $validated);

        return response()->json(['data' => OrderMessagePresenter::toArray($msg)], 201);
    }
}
