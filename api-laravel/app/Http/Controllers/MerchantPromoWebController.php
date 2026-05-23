<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class MerchantPromoWebController extends Controller
{
    private function merchantRestaurants()
    {
        $user = Auth::user();
        return Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->orderBy('name')->get();
    }

    public function index(Request $request)
    {
        $restaurants = $this->merchantRestaurants();
        if ($restaurants->isEmpty()) {
            return redirect()->route('restaurant.setup')
                ->with('error', 'Créez d’abord un établissement pour gérer les promos.');
        }

        $selectedRestaurantId = session('selected_restaurant_id', $restaurants->first()->id);

        $q = trim((string) $request->string('q'));
        $active = $request->string('active')->toString(); // 1|0|''
        $type = $request->string('type')->toString(); // percent|fixed|''

        $query = PromoCode::query()
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->when($selectedRestaurantId, fn ($qq) => $qq->where('restaurant_id', $selectedRestaurantId))
            ->orderByDesc('created_at');

        if (!empty($q)) $query->where('code', 'like', '%'.strtoupper($q).'%');
        if ($active === '1') $query->where('is_active', true);
        elseif ($active === '0') $query->where('is_active', false);
        if (!empty($type)) $query->where('type', $type);

        $promos = $query->paginate(20)->withQueryString();

        return view('restaurant.promos.index', compact('promos', 'restaurants', 'selectedRestaurantId'));
    }

    public function create()
    {
        $restaurants = $this->merchantRestaurants();
        if ($restaurants->isEmpty()) {
            return redirect()->route('restaurant.setup')
                ->with('error', 'Créez d’abord un établissement pour gérer les promos.');
        }
        $selectedRestaurantId = session('selected_restaurant_id', $restaurants->first()->id);

        return view('restaurant.promos.form', [
            'promo' => null,
            'restaurants' => $restaurants,
            'selectedRestaurantId' => $selectedRestaurantId,
        ]);
    }

    public function store(Request $request)
    {
        $restaurants = $this->merchantRestaurants();
        $validated = $request->validate([
            'restaurant_id' => ['required', Rule::in($restaurants->pluck('id')->all())],
            'code' => 'required|string|max:50|unique:promo_codes,code',
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
            'restaurant_id' => $validated['restaurant_id'],
            'type' => $validated['type'],
            'value' => (int) $validated['value'],
            'min_subtotal' => (int) ($validated['min_subtotal'] ?? 0),
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'max_uses' => $validated['max_uses'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? false),
        ]);

        return redirect()->route('restaurant.promos')->with('success', 'Promo créée.');
    }

    public function edit(PromoCode $promo)
    {
        $restaurants = $this->merchantRestaurants();
        abort_unless($restaurants->pluck('id')->contains($promo->restaurant_id), 403);

        return view('restaurant.promos.form', [
            'promo' => $promo,
            'restaurants' => $restaurants,
            'selectedRestaurantId' => $promo->restaurant_id,
        ]);
    }

    public function update(Request $request, PromoCode $promo)
    {
        $restaurants = $this->merchantRestaurants();
        abort_unless($restaurants->pluck('id')->contains($promo->restaurant_id), 403);

        $validated = $request->validate([
            'restaurant_id' => ['required', Rule::in($restaurants->pluck('id')->all())],
            'code' => ['required', 'string', 'max:50', Rule::unique('promo_codes', 'code')->ignore($promo->id)],
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
            'restaurant_id' => $validated['restaurant_id'],
            'type' => $validated['type'],
            'value' => (int) $validated['value'],
            'min_subtotal' => (int) ($validated['min_subtotal'] ?? 0),
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'max_uses' => $validated['max_uses'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? false),
        ]);

        return redirect()->route('restaurant.promos')->with('success', 'Promo mise à jour.');
    }

    public function destroy(PromoCode $promo)
    {
        $restaurants = $this->merchantRestaurants();
        abort_unless($restaurants->pluck('id')->contains($promo->restaurant_id), 403);

        $promo->delete();
        return back()->with('success', 'Promo supprimée.');
    }
}

