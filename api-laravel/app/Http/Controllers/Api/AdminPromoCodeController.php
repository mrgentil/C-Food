<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller as BaseController;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class AdminPromoCodeController extends BaseController
{
    public function index(Request $request)
    {
        $perPage = (int) ($request->integer('per_page') ?: 20);
        if ($perPage < 5) $perPage = 5;
        if ($perPage > 100) $perPage = 100;

        $q = trim((string) $request->string('q'));
        $active = $request->has('is_active') ? $request->boolean('is_active') : null;

        $query = PromoCode::query()->orderByDesc('created_at');
        if ($q !== '') {
            $query->where('code', 'like', '%'.$q.'%');
        }
        if ($active !== null) {
            $query->where('is_active', $active);
        }

        return response()->json(['data' => $query->paginate($perPage)]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code',
            'restaurant_id' => 'nullable|string',
            'type' => 'required|in:percent,fixed',
            'value' => 'required|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'min_subtotal' => 'sometimes|integer|min:0',
            'max_uses' => 'nullable|integer|min:1',
        ]);

        $promo = PromoCode::create([
            'code' => strtoupper(trim($validated['code'])),
            'restaurant_id' => $validated['restaurant_id'] ?? null,
            'type' => $validated['type'],
            'value' => (int) $validated['value'],
            'is_active' => $validated['is_active'] ?? true,
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'min_subtotal' => (int) ($validated['min_subtotal'] ?? 0),
            'max_uses' => $validated['max_uses'] ?? null,
            'uses_count' => 0,
        ]);

        return response()->json(['message' => 'Code promo créé', 'data' => $promo], 201);
    }

    public function update(Request $request, PromoCode $promo)
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:promo_codes,code,'.$promo->id,
            'restaurant_id' => 'nullable|string',
            'type' => 'sometimes|in:percent,fixed',
            'value' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'min_subtotal' => 'sometimes|integer|min:0',
            'max_uses' => 'nullable|integer|min:1',
        ]);

        if (isset($validated['code'])) {
            $validated['code'] = strtoupper(trim($validated['code']));
        }

        $promo->update($validated);

        return response()->json(['message' => 'Code promo mis à jour', 'data' => $promo]);
    }

    public function destroy(PromoCode $promo)
    {
        $promo->delete();
        return response()->json(['message' => 'Code promo supprimé']);
    }
}

