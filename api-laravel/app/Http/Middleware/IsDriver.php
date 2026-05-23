<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsDriver
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }
        if (empty($user->is_driver)) {
            return response()->json(['message' => 'Accès réservé aux livreurs'], 403);
        }
        return $next($request);
    }
}

