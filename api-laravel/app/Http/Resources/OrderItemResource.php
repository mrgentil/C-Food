<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'menu_item_id' => $this->menu_item_id,
            'menu_item' => new MenuItemResource($this->whenLoaded('menuItem')),
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'total' => $this->quantity * $this->unit_price,
            'selected_options' => $this->selected_options,
            'special_instructions' => $this->special_instructions,
        ];
    }
}
