<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PassController extends Controller
{
    /**
     * Activate CFoodPass (uses existing dash_pass fields).
     * In production this would be tied to a real payment flow.
     */
    public function subscribe(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Non authentifié'], 401);

        $validated = $request->validate([
            'duration_days' => 'nullable|integer|min:1|max:365',
        ]);

        $days = (int) ($validated['duration_days'] ?? 30);

        $now = Carbon::now();
        $base = $user->dash_pass_expires_at && $user->dash_pass_expires_at->gt($now)
            ? $user->dash_pass_expires_at
            : $now;

        $user->dash_pass = true;
        $user->dash_pass_expires_at = $base->copy()->addDays($days);
        $user->save();

        return response()->json([
            'message' => 'CFoodPass activé',
            'user' => $user,
        ]);
    }

    public function cancel(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Non authentifié'], 401);

        $user->dash_pass = false;
        $user->dash_pass_expires_at = null;
        $user->save();

        return response()->json([
            'message' => 'CFoodPass annulé',
            'user' => $user,
        ]);
    }

    public function status(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Non authentifié'], 401);

        $now = Carbon::now();
        $active = (bool) $user->dash_pass && (!$user->dash_pass_expires_at || $user->dash_pass_expires_at->gt($now));

        return response()->json([
            'data' => [
                'active' => $active,
                'expires_at' => $user->dash_pass_expires_at,
            ],
        ]);
    }
}

