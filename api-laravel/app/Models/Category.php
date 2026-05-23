<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'icon', 'color', 'image', 'show_on_home', 'store_type'];

    protected $casts = [
        'show_on_home' => 'boolean',
    ];

    public function scopeOnHome($query)
    {
        return $query->where('show_on_home', true);
    }

    public function restaurants()
    {
        return $this->belongsToMany(Restaurant::class, 'category_restaurant');
    }
}
