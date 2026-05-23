<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name', 'description', 'address', 'phone', 'website', 'email', 'image', 'logo', 'rating', 'review_count', 'delivery_time',
        'delivery_fee', 'distance', 'min_order', 'is_open', 'is_featured',
        'is_new', 'is_promoted', 'discount', 'type', 'latitude', 'longitude',
        'user_id', 'owner_user_id',
    ];

    protected $casts = [
        'is_open' => 'boolean',
        'is_featured' => 'boolean',
        'is_new' => 'boolean',
        'is_promoted' => 'boolean',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_restaurant');
    }

    public function menuCategories()
    {
        return $this->hasMany(MenuItemCategory::class);
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function favoritedBy()
    {
        return $this->hasMany(Favorite::class);
    }
}
