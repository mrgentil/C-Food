<?php

namespace App\Support;

use App\Models\User;

class DriverVerification
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public static function canOperate(User $user): bool
    {
        if (empty($user->is_driver)) {
            return false;
        }

        return ($user->driver_verification_status ?? self::STATUS_PENDING) === self::STATUS_APPROVED;
    }

    public static function hasRequiredDocuments(User $user): bool
    {
        return ! empty($user->driver_license_url)
            && ! empty($user->driver_insurance_url);
    }

    public static function label(?string $status): string
    {
        return match ($status) {
            self::STATUS_APPROVED => 'Vérifié',
            self::STATUS_REJECTED => 'Refusé',
            default => 'En attente',
        };
    }

    public static function profilePayload(User $user): array
    {
        $status = $user->driver_verification_status ?? self::STATUS_PENDING;

        return [
            'verification_status' => $status,
            'verification_label' => self::label($status),
            'verification_note' => $user->driver_verification_note,
            'verified_at' => optional($user->driver_verified_at)?->toIso8601String(),
            'can_go_online' => self::canOperate($user),
            'documents_complete' => self::hasRequiredDocuments($user),
            'license_url' => $user->driver_license_url,
            'insurance_url' => $user->driver_insurance_url,
            'id_url' => $user->driver_id_url,
        ];
    }
}
