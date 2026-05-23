<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'restaurant_id' => $this->restaurant_id,
            'restaurant' => new RestaurantResource($this->whenLoaded('restaurant')),
            'address' => new AddressResource($this->whenLoaded('address')),
            'driver' => new UserResource($this->whenLoaded('driver')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'subtotal' => $this->subtotal,
            'order_type' => $this->order_type ?? 'delivery',
            'delivery_fee' => $this->delivery_fee,
            'service_fee' => $this->service_fee,
            'discount_amount' => $this->discount_amount,
            'tip' => $this->tip,
            'total' => $this->total,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'transaction_id' => $this->transaction_id,
            'promo_code' => $this->promo_code,
            'delivery_instructions' => $this->delivery_instructions,
            'scheduled_for' => $this->scheduled_for,
            'estimated_delivery' => $this->estimated_delivery,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
