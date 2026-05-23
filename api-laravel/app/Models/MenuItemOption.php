<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItemOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_item_id', 'option_group', 'name', 'price',
        'is_required', 'multi_select', 'sort_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'multi_select' => 'boolean',
        'price' => 'integer',
        'sort_order' => 'integer',
    ];

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
