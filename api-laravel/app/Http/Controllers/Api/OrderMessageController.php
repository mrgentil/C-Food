<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderMessage;
use App\Support\OrderChatHelper;
use App\Support\OrderMessagePresenter;
use Illuminate\Http\Request;

class OrderMessageController extends Controller
{
    public function index(Request $request, string $orderId)
    {
        $user = $request->user();
        $order = Order::where('user_id', $user->id)->findOrFail($orderId);

        $messages = OrderMessage::where('order_id', $order->id)
            ->with(['user:id,name,photo'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn (OrderMessage $m) => OrderMessagePresenter::toArray($m));

        return response()->json(['data' => $messages]);
    }

    public function store(Request $request, string $orderId)
    {
        $user = $request->user();
        $order = Order::where('user_id', $user->id)->findOrFail($orderId);

        $validated = $request->validate([
            'message' => 'nullable|string|max:2000',
            'type' => 'nullable|string|in:text,image,video,audio,link',
            'media_url' => 'nullable|url|max:2048',
            'media_meta' => 'nullable|array',
        ]);

        if (empty($validated['message'] ?? null) && empty($validated['media_url'] ?? null)) {
            return response()->json(['message' => 'Message ou média requis.'], 422);
        }

        $msg = OrderChatHelper::create($order, $user, 'user', $validated);

        return response()->json(['data' => OrderMessagePresenter::toArray($msg)], 201);
    }
}
