<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IsRestaurant
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        $isMerchant = (bool) ($user?->is_merchant ?? false) || (bool) ($user?->is_restaurant ?? false);

        if (!Auth::check() || !$isMerchant) {
            abort(403, 'Accès non autorisé.');
        }

        return $next($request);
    }
}
