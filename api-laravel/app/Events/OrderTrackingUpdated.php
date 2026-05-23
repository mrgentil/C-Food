<?php

namespace App\Events;

use App\Models\Order;
use App\Support\OrderTrackingPresenter;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderTrackingUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('orders.'.$this->order->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'tracking.updated';
    }

    public function broadcastWith(): array
    {
        return OrderTrackingPresenter::toArray($this->order);
    }
}
