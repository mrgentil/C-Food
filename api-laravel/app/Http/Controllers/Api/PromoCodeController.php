<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function index(Request $request)
    {
        // Only active + not expired promos
        $promos = PromoCode::query()
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function (PromoCode $p) {
                return [
                    'code' => $p->code,
                    'type' => $p->type,
                    'value' => (int) $p->value,
                    'min_subtotal' => (int) ($p->min_subtotal ?? 0),
                    'starts_at' => $p->starts_at,
                    'expires_at' => $p->expires_at,
                ];
            });

        return response()->json(['data' => $promos]);
    }

    public function validateCode(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'subtotal' => 'required|integer|min:0',
        ]);

        $code = strtoupper(trim($validated['code']));
        $subtotal = (int) $validated['subtotal'];

        $promo = PromoCode::where('code', $code)->first();
        if (!$promo) {
            return response()->json(['message' => 'Code promo invalide.'], 404);
        }

        if (!$promo->isCurrentlyValid($subtotal)) {
            return response()->json(['message' => 'Code promo non applicable.'], 422);
        }

        $discount = $promo->computeDiscount($subtotal);

        return response()->json([
            'data' => [
                'code' => $promo->code,
                'discount_amount' => $discount,
                'type' => $promo->type,
                'value' => (int) $promo->value,
            ],
        ]);
    }
}

