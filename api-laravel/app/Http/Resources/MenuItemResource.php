<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'image' => $this->image,
            'category_id' => $this->category_id,
            'is_available' => $this->is_available,
            'is_popular' => $this->is_popular,
            'is_new' => $this->is_new,
            'is_vegetarian' => $this->is_vegetarian ?? false,
            'calories' => $this->calories,
            'preparation_time' => $this->preparation_time,
            'options' => $this->whenLoaded('options', function() {
                return $this->options->groupBy('option_group')->map(function($group) {
                    return [
                        'group_name' => $group->first()->option_group,
                        'required' => $group->first()->is_required,
                        'multi_select' => $group->first()->multi_select,
                        'options' => $group->map(function($option) {
                            return [
                                'id' => $option->id,
                                'name' => $option->name,
                                'price' => $option->price,
                            ];
                        }),
                    ];
                })->values();
            }),
        ];
    }
}
