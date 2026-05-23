<?php

namespace App\Support;

use App\Http\Controllers\Api\NotificationController;
use App\Models\User;
use Illuminate\Support\Str;

class DriverVerificationNotifier
{
    public static function notifyStatusChange(User $driver): void
    {
        $status = $driver->driver_verification_status ?? DriverVerification::STATUS_PENDING;

        if ($status === DriverVerification::STATUS_APPROVED) {
            NotificationController::sendExpoPush(
                $driver->expo_push_token,
                'Compte vérifié',
                'Votre dossier livreur est approuvé. Vous pouvez passer en ligne et accepter des courses.',
                [
                    'type' => 'driver_verification',
                    'status' => 'approved',
                ]
            );

            return;
        }

        if ($status === DriverVerification::STATUS_REJECTED) {
            $body = $driver->driver_verification_note
                ? Str::limit(trim((string) $driver->driver_verification_note), 160)
                : 'Merci de corriger vos documents dans Mon véhicule.';

            NotificationController::sendExpoPush(
                $driver->expo_push_token,
                'Dossier livreur refusé',
                $body,
                [
                    'type' => 'driver_verification',
                    'status' => 'rejected',
                ]
            );
        }
    }
}
