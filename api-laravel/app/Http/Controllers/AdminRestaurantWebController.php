<?php

namespace App\Http\Controllers;

use App\Models\AppTab;
use App\Models\PromoCode;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminRestaurantWebController extends Controller
{
    private function storeTypeRule(): array
    {
        $slugs = AppTab::allowedStoreTypeSlugs();
        if (empty($slugs)) {
            $slugs = ['restaurant', 'grocery', 'supermarket', 'alcohol', 'flowers', 'pharmacy', 'pet'];
        }

        return ['required', Rule::in($slugs)];
    }

    private function storeTypesForForm()
    {
        $tabs = AppTab::query()->ordered()->get(['slug', 'name']);
        if ($tabs->isEmpty()) {
            return collect([
                'restaurant' => 'restaurant',
                'grocery' => 'grocery',
                'alcohol' => 'alcohol',
                'flowers' => 'flowers',
                'pharmacy' => 'pharmacy',
                'pet' => 'pet',
            ]);
        }

        return $tabs->pluck('name', 'slug');
    }

    public function create()
    {
        $owners = User::query()
            ->where(function ($q) {
                $q->where('is_merchant', true)->orWhere('is_restaurant', true);
            })
            ->orderBy('name')
            ->get();

        $storeTypes = $this->storeTypesForForm();

        return view('admin.restaurants-create', compact('owners', 'storeTypes'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => $this->storeTypeRule(),
            'owner_user_id' => 'nullable|exists:users,id',
            'is_open' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'is_new' => 'nullable|boolean',
            'is_promoted' => 'nullable|boolean',
            'delivery_time' => 'nullable|string|max:50',
            'delivery_fee' => 'nullable|integer|min:0',
            'min_order' => 'nullable|integer|min:0',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'image' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|max:4096',
            'logo' => 'nullable|string|max:255',
            'logo_file' => 'nullable|image|max:4096',
        ]);

        $imageValue = $validated['image'] ?? null;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('stores', 'public');
            $imageValue = Storage::url($path);
        }

        $logoValue = $validated['logo'] ?? null;
        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('stores/logos', 'public');
            $logoValue = Storage::url($path);
        }

        Restaurant::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'owner_user_id' => $validated['owner_user_id'] ?? null,
            'is_open' => (bool) ($validated['is_open'] ?? false),
            'is_featured' => $request->boolean('is_featured'),
            'is_new' => $request->boolean('is_new'),
            'is_promoted' => $request->boolean('is_promoted'),
            'delivery_time' => $validated['delivery_time'] ?? '30-40 min',
            'delivery_fee' => (int) ($validated['delivery_fee'] ?? 0),
            'min_order' => (int) ($validated['min_order'] ?? 0),
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'description' => $validated['description'] ?? null,
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'website' => $validated['website'] ?? null,
            'email' => $validated['email'] ?? null,
            'image' => $imageValue,
            'logo' => $logoValue,
        ]);

        return redirect()->route('admin.restaurants')->with('success', 'Établissement créé.');
    }

    public function edit(Restaurant $restaurant)
    {
        $restaurant->loadCount(['orders', 'menuItems']);

        $owners = User::query()
            ->where(function ($q) {
                $q->where('is_merchant', true)->orWhere('is_restaurant', true);
            })
            ->orderBy('name')
            ->get();

        $storeTypes = $this->storeTypesForForm();

        return view('admin.restaurants-form', compact('restaurant', 'owners', 'storeTypes'));
    }

    public function update(Request $request, Restaurant $restaurant)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => $this->storeTypeRule(),
            'owner_user_id' => 'nullable|exists:users,id',
            'is_open' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'is_new' => 'nullable|boolean',
            'is_promoted' => 'nullable|boolean',
            'delivery_time' => 'nullable|string|max:50',
            'delivery_fee' => 'nullable|integer|min:0',
            'min_order' => 'nullable|integer|min:0',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'image' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|max:4096',
            'logo' => 'nullable|string|max:255',
            'logo_file' => 'nullable|image|max:4096',
        ]);

        $imageValue = $validated['image'] ?? $restaurant->image;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('stores', 'public');
            $imageValue = Storage::url($path);
        }

        $logoValue = $validated['logo'] ?? $restaurant->logo;
        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('stores/logos', 'public');
            $logoValue = Storage::url($path);
        }

        $restaurant->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'owner_user_id' => $validated['owner_user_id'] ?? null,
            'is_open' => (bool) ($validated['is_open'] ?? false),
            'is_featured' => $request->boolean('is_featured'),
            'is_new' => $request->boolean('is_new'),
            'is_promoted' => $request->boolean('is_promoted'),
            'delivery_time' => $validated['delivery_time'] ?? $restaurant->delivery_time,
            'delivery_fee' => (int) ($validated['delivery_fee'] ?? $restaurant->delivery_fee),
            'min_order' => (int) ($validated['min_order'] ?? $restaurant->min_order),
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'description' => $validated['description'] ?? $restaurant->description,
            'address' => $validated['address'] ?? $restaurant->address,
            'phone' => $validated['phone'] ?? $restaurant->phone,
            'website' => $validated['website'] ?? $restaurant->website,
            'email' => $validated['email'] ?? $restaurant->email,
            'image' => $imageValue,
            'logo' => $logoValue,
        ]);

        return redirect()->route('admin.restaurants')->with('success', 'Établissement mis à jour.');
    }

    public function destroy(Restaurant $restaurant)
    {
        DB::transaction(function () use ($restaurant) {
            PromoCode::query()->where('restaurant_id', $restaurant->id)->delete();
            $restaurant->delete();
        });

        return redirect()->route('admin.restaurants')->with('success', 'Établissement supprimé.');
    }
}

