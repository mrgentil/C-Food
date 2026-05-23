<?php

namespace App\Events;

use App\Models\OrderMessage;
use App\Support\OrderMessagePresenter;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public OrderMessage $message) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('orders.'.$this->message->order_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.message';
    }

    public function broadcastWith(): array
    {
        return OrderMessagePresenter::toArray($this->message);
    }
}
