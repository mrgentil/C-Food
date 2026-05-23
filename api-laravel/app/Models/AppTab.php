<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppTab extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'icon',
        'sort_order',
        'is_published',
        'is_home_tab',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_home_tab' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public static function allowedStoreTypeSlugs(): array
    {
        return static::query()->pluck('slug')->all();
    }
}
