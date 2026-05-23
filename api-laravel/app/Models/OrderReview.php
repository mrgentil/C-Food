<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class OrderReview extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'restaurant_id',
        'driver_id',
        'restaurant_rating',
        'driver_rating',
        'feedback',
        'tags',
    ];

    protected $casts = [
        'restaurant_rating' => 'integer',
        'driver_rating' => 'integer',
        'tags' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public static function refreshRestaurantStats(string $restaurantId): void
    {
        $avg = static::query()->where('restaurant_id', $restaurantId)->avg('restaurant_rating');
        $cnt = static::query()->where('restaurant_id', $restaurantId)->count();

        Restaurant::whereKey($restaurantId)->update([
            'rating' => $cnt > 0 ? round((float) $avg, 1) : 0,
            'review_count' => $cnt,
        ]);
    }

    public static function refreshDriverStats(int|string|null $driverId): void
    {
        if ($driverId === null || $driverId === '') {
            return;
        }

        $id = (int) $driverId;

        $avg = static::query()
            ->where('driver_id', $id)
            ->whereNotNull('driver_rating')
            ->avg('driver_rating');

        if ($avg === null) {
            return;
        }

        DB::table('users')->where('id', $id)->update([
            'driver_rating' => round((float) $avg, 2),
        ]);
    }
}
