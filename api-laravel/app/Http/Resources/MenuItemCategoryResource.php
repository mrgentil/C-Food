<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'name' => $this->name,
            'description' => $this->description,
            'sort_order' => $this->sort_order,
            'is_available' => $this->is_available,
            'menu_items' => MenuItemResource::collection(
                $this->whenLoaded('menuItems', fn($items) => $items->where('is_available', true))
            ),
        ];
    }
}
