<?php

namespace App\Support;

use App\Models\User;

class DriverProfilePresenter
{
    public static function toArray(User $user): array
    {
        return array_merge([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'photo' => $user->photo,
            'city' => $user->city,
            'vehicle_type' => $user->vehicle_type,
            'plate_number' => $user->plate_number,
            'is_online' => (bool) $user->is_online,
            'driver_rating' => (float) ($user->driver_rating ?? 5),
            'total_deliveries' => (int) ($user->total_deliveries ?? 0),
        ], DriverVerification::profilePayload($user));
    }
}
