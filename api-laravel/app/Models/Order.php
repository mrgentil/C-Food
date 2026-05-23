<?php

namespace App\Models;

use App\Support\OrderPayment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (!$order->id) {
                $order->id = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'user_id', 'restaurant_id', 'driver_id', 'address_id',
        'driver_latitude', 'driver_longitude', 'last_location_update',
        'order_type',
        'subtotal', 'delivery_fee', 'service_fee', 'discount_amount', 'tax', 'tip',
        'total', 'status', 'payment_method', 'transaction_id', 'paid_at', 'cash_collected_at',
        'promo_code', 'delivery_instructions', 'delivery_photo_url', 'is_group_order',
        'scheduled_for', 'estimated_delivery',
    ];

    protected $casts = [
        'is_group_order' => 'boolean',
        'subtotal' => 'integer',
        'delivery_fee' => 'integer',
        'service_fee' => 'integer',
        'discount_amount' => 'integer',
        'tax' => 'integer',
        'tip' => 'integer',
        'total' => 'integer',
        'driver_latitude' => 'float',
        'driver_longitude' => 'float',
        'last_location_update' => 'datetime',
        'accepted_at' => 'datetime',
        'preparing_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'delivering_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'scheduled_for' => 'datetime',
        'estimated_delivery' => 'datetime',
        'paid_at' => 'datetime',
        'cash_collected_at' => 'datetime',
    ];

    protected $appends = [
        'payment_summary',
    ];

    public function getPaymentSummaryAttribute(): array
    {
        return OrderPayment::summary($this);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function review()
    {
        return $this->hasOne(OrderReview::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
