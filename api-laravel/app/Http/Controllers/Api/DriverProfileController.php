<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\DriverProfilePresenter;
use App\Support\DriverVerification;
use Illuminate\Http\Request;

class DriverProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'data' => DriverProfilePresenter::toArray($request->user()),
        ]);
    }

    public function update(Request $request)
    {
        $u = $request->user();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:80',
            'vehicle_type' => 'nullable|string|max:20',
            'plate_number' => 'nullable|string|max:40',
            'photo' => 'nullable|string|max:500',
            'is_online' => 'nullable|boolean',
            'license_url' => 'nullable|string|max:2048',
            'insurance_url' => 'nullable|string|max:2048',
            'id_url' => 'nullable|string|max:2048',
        ]);

        if (array_key_exists('is_online', $validated) && $validated['is_online']) {
            if (! DriverVerification::canOperate($u)) {
                $status = $u->driver_verification_status ?? DriverVerification::STATUS_PENDING;

                $message = match ($status) {
                    DriverVerification::STATUS_REJECTED => 'Compte refusé. Contactez le support ou mettez à jour vos documents.',
                    default => DriverVerification::hasRequiredDocuments($u)
                        ? 'Votre dossier est en cours de vérification par l\'administration.'
                        : 'Téléversez votre permis et votre assurance avant de passer en ligne.',
                };

                return response()->json(['message' => $message], 422);
            }
        }

        $map = [
            'name' => 'name',
            'phone' => 'phone',
            'city' => 'city',
            'vehicle_type' => 'vehicle_type',
            'plate_number' => 'plate_number',
            'photo' => 'photo',
            'is_online' => 'is_online',
            'license_url' => 'driver_license_url',
            'insurance_url' => 'driver_insurance_url',
            'id_url' => 'driver_id_url',
        ];

        $documentsTouched = false;
        foreach ($map as $key => $column) {
            if (! array_key_exists($key, $validated)) {
                continue;
            }
            if (in_array($column, ['driver_license_url', 'driver_insurance_url', 'driver_id_url'], true)) {
                $documentsTouched = true;
            }
            $u->{$column} = $validated[$key];
        }

        if ($documentsTouched && $u->driver_verification_status === DriverVerification::STATUS_REJECTED) {
            $u->driver_verification_status = DriverVerification::STATUS_PENDING;
            $u->driver_verification_note = null;
            $u->driver_verified_at = null;
            $u->driver_verified_by = null;
        }

        $u->save();

        return $this->show($request);
    }
}
