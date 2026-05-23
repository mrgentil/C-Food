<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image' => $this->image,
            'logo' => $this->logo,
            'category' => $this->category,
            'rating' => $this->rating ?? 4.5,
            'review_count' => $this->review_count ?? 0,
            'delivery_time' => $this->delivery_time,
            'delivery_fee' => $this->delivery_fee,
            'minimum_order' => $this->minimum_order ?? 0,
            'distance' => $this->distance,
            'is_open' => $this->is_open,
            'is_new' => $this->is_new,
            'is_promoted' => $this->is_promoted,
            'is_free_delivery' => $this->delivery_fee == 0,
            'description' => $this->description,
            'address' => $this->address,
            'phone' => $this->phone,
            'tags' => $this->tags ? explode(',', $this->tags) : [],
            'featured' => $this->featured,
            'categories' => MenuItemCategoryResource::collection(
                $this->whenLoaded('menuCategories', fn($cats) => $cats->where('is_available', true))
            ),
            'menu_items' => MenuItemResource::collection(
                $this->whenLoaded('menuItems', fn($items) => $items->where('is_available', true))
            ),
        ];
    }
}
