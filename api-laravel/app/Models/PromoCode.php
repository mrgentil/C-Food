<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'restaurant_id',
        'type',
        'value',
        'is_active',
        'starts_at',
        'expires_at',
        'min_subtotal',
        'max_uses',
        'uses_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'min_subtotal' => 'integer',
        'max_uses' => 'integer',
        'uses_count' => 'integer',
        'value' => 'integer',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function isCurrentlyValid(int $subtotal): bool
    {
        if (!$this->is_active) return false;
        if ($subtotal < (int) ($this->min_subtotal ?? 0)) return false;

        $now = Carbon::now();
        if ($this->starts_at && $now->lt($this->starts_at)) return false;
        if ($this->expires_at && $now->gt($this->expires_at)) return false;

        if ($this->max_uses !== null && (int) $this->uses_count >= (int) $this->max_uses) return false;
        return true;
    }

    public function computeDiscount(int $subtotal): int
    {
        if (!$this->isCurrentlyValid($subtotal)) return 0;

        if ($this->type === 'fixed') {
            return min((int) $this->value, $subtotal);
        }

        $pct = max(0, min(100, (int) $this->value));
        return (int) round($subtotal * ($pct / 100));
    }
}

