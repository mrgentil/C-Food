<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\MenuItemCategory;
use App\Models\Restaurant;
use App\Support\AdminHtmx;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminMenuItemWebController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->get('q', ''));
        $restaurantId = (string) $request->get('restaurant_id', '');
        $menuCategoryId = (string) $request->get('category_id', '');
        $perPage = (int) $request->get('per_page', 15);
        if ($perPage <= 0 || $perPage > 100) $perPage = 15;

        $restaurants = Restaurant::query()->orderBy('name')->get();

        $menuCategories = MenuItemCategory::query()
            ->when($restaurantId, fn ($qq) => $qq->where('restaurant_id', $restaurantId))
            ->orderBy('name')
            ->get();

        $rows = MenuItem::query()
            ->with(['restaurant', 'category'])
            ->when($restaurantId, fn ($qq) => $qq->where('restaurant_id', $restaurantId))
            ->when($menuCategoryId, fn ($qq) => $qq->where('category_id', $menuCategoryId))
            ->when($q, fn ($qq) => $qq->where('name', 'like', "%{$q}%"))
            ->orderBy('restaurant_id')
            ->orderBy('category')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        $data = [
            'rows' => $rows,
            'restaurants' => $restaurants,
            'menuCategories' => $menuCategories,
            'q' => $q,
            'restaurantId' => $restaurantId,
            'menuCategoryId' => $menuCategoryId,
            'perPage' => $perPage,
        ];

        return AdminHtmx::list($request, 'admin.menu-items.index', 'admin.partials.menu-items-list', $data);
    }

    public function create(Request $request)
    {
        $restaurants = Restaurant::query()->orderBy('name')->get();
        $restaurantId = (string) $request->get('restaurant_id', '');
        $menuCategoryId = (string) $request->get('category_id', '');

        $menuCategories = MenuItemCategory::query()
            ->when($restaurantId, fn ($qq) => $qq->where('restaurant_id', $restaurantId))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return view('admin.menu-items.form', [
            'row' => null,
            'restaurants' => $restaurants,
            'menuCategories' => $menuCategories,
            'restaurantId' => $restaurantId,
            'menuCategoryId' => $menuCategoryId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'category_id' => 'nullable|exists:menu_item_categories,id',
            'category' => 'required|string|max:100',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:2048',
            'image_file' => 'nullable|image|max:4096',
            'is_available' => 'nullable|boolean',
            'is_popular' => 'nullable|boolean',
            'is_veg' => 'nullable|boolean',
            'is_spicy' => 'nullable|boolean',
        ]);

        $image = $validated['image'] ?? null;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('menu-items', 'public');
            $image = Storage::url($path);
        }

        MenuItem::create([
            'id' => (string) Str::uuid(),
            'restaurant_id' => $validated['restaurant_id'],
            'category_id' => $validated['category_id'] ?? null,
            'category' => $validated['category'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => (int) round(((float) $validated['price']) * 1),
            'image' => $image,
            'is_available' => (bool) ($validated['is_available'] ?? true),
            'is_popular' => (bool) ($validated['is_popular'] ?? false),
            'is_veg' => (bool) ($validated['is_veg'] ?? false),
            'is_spicy' => (bool) ($validated['is_spicy'] ?? false),
        ]);

        return redirect()->route('admin.menuItems', ['restaurant_id' => $validated['restaurant_id']])
            ->with('success', 'Article créé.');
    }

    public function edit(MenuItem $menuItem)
    {
        $restaurants = Restaurant::query()->orderBy('name')->get();
        $menuCategories = MenuItemCategory::query()
            ->where('restaurant_id', $menuItem->restaurant_id)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return view('admin.menu-items.form', [
            'row' => $menuItem,
            'restaurants' => $restaurants,
            'menuCategories' => $menuCategories,
            'restaurantId' => $menuItem->restaurant_id,
            'menuCategoryId' => (string) ($menuItem->category_id ?? ''),
        ]);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'category_id' => 'nullable|exists:menu_item_categories,id',
            'category' => 'required|string|max:100',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:2048',
            'image_file' => 'nullable|image|max:4096',
            'is_available' => 'nullable|boolean',
            'is_popular' => 'nullable|boolean',
            'is_veg' => 'nullable|boolean',
            'is_spicy' => 'nullable|boolean',
        ]);

        $image = $validated['image'] ?? $menuItem->image;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('menu-items', 'public');
            $image = Storage::url($path);
        }

        $menuItem->update([
            'restaurant_id' => $validated['restaurant_id'],
            'category_id' => $validated['category_id'] ?? null,
            'category' => $validated['category'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => (int) round(((float) $validated['price']) * 1),
            'image' => $image,
            'is_available' => (bool) ($validated['is_available'] ?? true),
            'is_popular' => (bool) ($validated['is_popular'] ?? false),
            'is_veg' => (bool) ($validated['is_veg'] ?? false),
            'is_spicy' => (bool) ($validated['is_spicy'] ?? false),
        ]);

        return redirect()->route('admin.menuItems', ['restaurant_id' => $validated['restaurant_id']])
            ->with('success', 'Article mis à jour.');
    }

    public function destroy(MenuItem $menuItem)
    {
        $restaurantId = $menuItem->restaurant_id;
        $menuItem->delete();

        return redirect()->route('admin.menuItems', ['restaurant_id' => $restaurantId])
            ->with('success', 'Article supprimé.');
    }
}

