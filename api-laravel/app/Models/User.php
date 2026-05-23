<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'photo',
        'password',
        'dash_pass',
        'dash_pass_expires_at',
        'expo_push_token',
        'is_admin',
        'is_restaurant',
        'is_merchant',
        'is_driver',
        'driver_verification_status',
        'driver_license_url',
        'driver_insurance_url',
        'driver_id_url',
        'driver_verification_note',
        'driver_verified_at',
        'driver_verified_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'dash_pass' => 'boolean',
        'dash_pass_expires_at' => 'datetime',
        'is_admin' => 'boolean',
        'is_restaurant' => 'boolean',
        'is_merchant' => 'boolean',
        'is_driver' => 'boolean',
        'suspended_at' => 'datetime',
        'driver_verified_at' => 'datetime',
    ];

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function defaultAddress()
    {
        return $this->hasOne(Address::class)->where('is_default', true);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function drivenOrders()
    {
        return $this->hasMany(Order::class, 'driver_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function restaurants()
    {
        return $this->hasMany(Restaurant::class);
    }

    public function stores()
    {
        return $this->hasMany(Store::class, 'owner_user_id');
    }
}
