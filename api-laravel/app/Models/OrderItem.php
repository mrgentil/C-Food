<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OrderItem extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (OrderItem $item) {
            if (!$item->id) {
                $item->id = (string) Str::uuid();
            }
        });
    }

    protected $fillable = ['order_id', 'menu_item_id', 'quantity', 'unit_price', 'selected_options', 'special_instructions'];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'integer',
        'selected_options' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function getSubtotalAttribute()
    {
        return $this->quantity * $this->unit_price;
    }
}
