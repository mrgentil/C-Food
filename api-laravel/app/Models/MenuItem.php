<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'restaurant_id', 'name', 'description', 'price', 'image',
        'category', 'category_id', 'is_popular', 'is_veg', 'is_spicy',
        'is_available', 'options',
    ];

    protected $casts = [
        'is_popular' => 'boolean',
        'is_veg' => 'boolean',
        'is_spicy' => 'boolean',
        'is_available' => 'boolean',
        'options' => 'array',
        'price' => 'integer',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category()
    {
        return $this->belongsTo(MenuItemCategory::class, 'category_id');
    }

    public function options()
    {
        return $this->hasMany(MenuItemOption::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
