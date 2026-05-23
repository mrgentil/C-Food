<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class NotificationController extends Controller
{
    public function registerPushToken(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Non authentifié'], 401);

        $validated = $request->validate([
            'expo_push_token' => 'required|string|max:255',
        ]);

        $user->expo_push_token = $validated['expo_push_token'];
        $user->save();

        return response()->json(['message' => 'Token enregistré']);
    }

    public static function sendExpoPush(?string $token, string $title, string $body, array $data = []): void
    {
        if (
            !$token
            || !(str_starts_with($token, 'ExponentPushToken[') || str_starts_with($token, 'ExpoPushToken['))
        ) {
            return;
        }

        try {
            Http::timeout(6)->post('https://exp.host/--/api/v2/push/send', [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => 'default',
                'priority' => 'high',
            ]);
        } catch (\Throwable $e) {
            // Ignore push failures (network / invalid token)
        }
    }
}

