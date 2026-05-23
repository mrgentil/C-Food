<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShopType extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'category', 'image', 'status', 'order_index'];
}
