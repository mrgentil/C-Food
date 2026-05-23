<?php

namespace App\Http\Controllers;

use App\Models\MenuItemCategory;
use App\Models\Restaurant;
use App\Support\AdminHtmx;
use Illuminate\Http\Request;

class AdminMenuCategoryWebController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->get('q', ''));
        $restaurantId = (string) $request->get('restaurant_id', '');
        $perPage = (int) $request->get('per_page', 15);
        if ($perPage <= 0 || $perPage > 100) $perPage = 15;

        $restaurants = Restaurant::query()->orderBy('name')->get();

        $rows = MenuItemCategory::query()
            ->with('restaurant')
            ->when($restaurantId, fn ($qq) => $qq->where('restaurant_id', $restaurantId))
            ->when($q, fn ($qq) => $qq->where('name', 'like', "%{$q}%"))
            ->orderBy('restaurant_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        $data = compact('rows', 'restaurants', 'q', 'restaurantId', 'perPage');

        return AdminHtmx::list($request, 'admin.menu-categories.index', 'admin.partials.menu-categories-list', $data);
    }

    public function create(Request $request)
    {
        $restaurants = Restaurant::query()->orderBy('name')->get();
        $restaurantId = (string) $request->get('restaurant_id', '');

        return view('admin.menu-categories.form', [
            'row' => null,
            'restaurants' => $restaurants,
            'restaurantId' => $restaurantId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0|max:999',
            'is_available' => 'nullable|boolean',
        ]);

        MenuItemCategory::create([
            'restaurant_id' => $validated['restaurant_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_available' => (bool) ($validated['is_available'] ?? true),
        ]);

        return redirect()->route('admin.menuCategories', ['restaurant_id' => $validated['restaurant_id']])
            ->with('success', 'Section de menu créée.');
    }

    public function edit(MenuItemCategory $menuCategory)
    {
        $restaurants = Restaurant::query()->orderBy('name')->get();

        return view('admin.menu-categories.form', [
            'row' => $menuCategory,
            'restaurants' => $restaurants,
            'restaurantId' => $menuCategory->restaurant_id,
        ]);
    }

    public function update(Request $request, MenuItemCategory $menuCategory)
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0|max:999',
            'is_available' => 'nullable|boolean',
        ]);

        $menuCategory->update([
            'restaurant_id' => $validated['restaurant_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_available' => (bool) ($validated['is_available'] ?? true),
        ]);

        return redirect()->route('admin.menuCategories', ['restaurant_id' => $validated['restaurant_id']])
            ->with('success', 'Section de menu mise à jour.');
    }

    public function destroy(MenuItemCategory $menuCategory)
    {
        $restaurantId = $menuCategory->restaurant_id;
        $menuCategory->delete();

        return redirect()->route('admin.menuCategories', ['restaurant_id' => $restaurantId])
            ->with('success', 'Section supprimée.');
    }
}

