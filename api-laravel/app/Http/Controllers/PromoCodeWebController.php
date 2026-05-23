<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use App\Models\Restaurant;
use App\Support\AdminHtmx;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PromoCodeWebController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->string('q'));
        $active = $request->string('active')->toString(); // 1|0|''
        $type = $request->string('type')->toString(); // percent|fixed|''
        $perPage = (int) ($request->integer('per_page') ?: 20);
        if ($perPage < 5) $perPage = 5;
        if ($perPage > 100) $perPage = 100;

        $query = PromoCode::query()->orderByDesc('created_at');

        if (!empty($q)) {
            $query->where('code', 'like', '%'.strtoupper($q).'%');
        }
        if ($active === '1') {
            $query->where('is_active', true);
        } elseif ($active === '0') {
            $query->where('is_active', false);
        }
        if (!empty($type)) {
            $query->where('type', $type);
        }

        $promos = $query->paginate($perPage)->withQueryString();

        return AdminHtmx::list($request, 'admin.promos.index', 'admin.partials.promos-list', compact('promos'));
    }

    public function create()
    {
        $restaurants = Restaurant::query()->orderBy('name')->get();
        return view('admin.promos.form', ['promo' => null, 'restaurants' => $restaurants]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code',
            'restaurant_id' => 'nullable|exists:restaurants,id',
            'type' => ['required', Rule::in(['percent', 'fixed'])],
            'value' => 'required|integer|min:1',
            'min_subtotal' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'max_uses' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        PromoCode::create([
            'code' => strtoupper(trim($validated['code'])),
            'restaurant_id' => $validated['restaurant_id'] ?? null,
            'type' => $validated['type'],
            'value' => (int) $validated['value'],
            'min_subtotal' => (int) ($validated['min_subtotal'] ?? 0),
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'max_uses' => $validated['max_uses'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? false),
        ]);

        return redirect()->route('admin.promos')->with('success', 'Code promo créé.');
    }

    public function edit(PromoCode $promo)
    {
        $restaurants = Restaurant::query()->orderBy('name')->get();
        return view('admin.promos.form', compact('promo', 'restaurants'));
    }

    public function update(Request $request, PromoCode $promo)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('promo_codes', 'code')->ignore($promo->id)],
            'restaurant_id' => 'nullable|exists:restaurants,id',
            'type' => ['required', Rule::in(['percent', 'fixed'])],
            'value' => 'required|integer|min:1',
            'min_subtotal' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'max_uses' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        $promo->update([
            'code' => strtoupper(trim($validated['code'])),
            'restaurant_id' => $validated['restaurant_id'] ?? null,
            'type' => $validated['type'],
            'value' => (int) $validated['value'],
            'min_subtotal' => (int) ($validated['min_subtotal'] ?? 0),
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'max_uses' => $validated['max_uses'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? false),
        ]);

        return redirect()->route('admin.promos')->with('success', 'Code promo mis à jour.');
    }

    public function destroy(PromoCode $promo)
    {
        $promo->delete();
        return redirect()->route('admin.promos')->with('success', 'Code promo supprimé.');
    }
}

