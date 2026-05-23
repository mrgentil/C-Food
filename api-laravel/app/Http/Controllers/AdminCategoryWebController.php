<?php

namespace App\Http\Controllers;

use App\Models\AppTab;
use App\Models\Category;
use App\Support\AdminHtmx;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminCategoryWebController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->string('q'));
        $scope = (string) $request->string('scope', 'home');
        $perPage = (int) ($request->integer('per_page') ?: 30);
        if ($perPage < 5) {
            $perPage = 5;
        }
        if ($perPage > 100) {
            $perPage = 100;
        }

        $query = Category::query()->orderBy('name');

        if ($scope === 'home') {
            $query->where('show_on_home', true);
        } elseif ($scope === 'tags') {
            $query->where('show_on_home', false);
        }

        if ($q !== '') {
            $query->where('name', 'like', '%'.$q.'%');
        }

        $categories = $query->paginate($perPage)->withQueryString();
        $storeTypes = AppTab::query()->ordered()->pluck('name', 'slug');

        return AdminHtmx::list(
            $request,
            'admin.categories.index',
            'admin.partials.categories-list',
            compact('categories', 'scope', 'storeTypes')
        );
    }

    public function create(Request $request)
    {
        $defaultScope = $request->string('scope', 'home') === 'tags' ? 'tags' : 'home';
        $storeTypes = AppTab::query()->ordered()->pluck('name', 'slug');

        return view('admin.categories.form', [
            'category' => null,
            'defaultScope' => $defaultScope,
            'storeTypes' => $storeTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateCategory($request);

        $imageValue = $this->resolveImage($request, $validated);

        Category::create([
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? null,
            'color' => $validated['color'] ?? null,
            'image' => $imageValue,
            'show_on_home' => (bool) ($validated['show_on_home'] ?? false),
            'store_type' => $validated['store_type'] ?? 'restaurant',
        ]);

        return redirect()
            ->route('admin.categories', ['scope' => ($validated['show_on_home'] ?? false) ? 'home' : 'tags'])
            ->with('success', 'Rubrique créée.');
    }

    public function edit(Category $category)
    {
        $storeTypes = AppTab::query()->ordered()->pluck('name', 'slug');

        return view('admin.categories.form', [
            'category' => $category,
            'defaultScope' => $category->show_on_home ? 'home' : 'tags',
            'storeTypes' => $storeTypes,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $this->validateCategory($request);

        $imageValue = $this->resolveImage($request, $validated, $category->image);

        $category->update([
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? null,
            'color' => $validated['color'] ?? null,
            'image' => $imageValue,
            'show_on_home' => (bool) ($validated['show_on_home'] ?? false),
            'store_type' => $validated['store_type'] ?? 'restaurant',
        ]);

        return redirect()
            ->route('admin.categories', ['scope' => ($validated['show_on_home'] ?? false) ? 'home' : 'tags'])
            ->with('success', 'Rubrique mise à jour.');
    }

    public function destroy(Category $category)
    {
        $scope = $category->show_on_home ? 'home' : 'tags';
        $category->delete();

        return redirect()->route('admin.categories', ['scope' => $scope])->with('success', 'Rubrique supprimée.');
    }

    private function validateCategory(Request $request): array
    {
        $slugs = AppTab::allowedStoreTypeSlugs();
        if (empty($slugs)) {
            $slugs = ['restaurant', 'grocery', 'supermarket', 'alcohol', 'flowers', 'pharmacy', 'pet'];
        }

        return $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:20',
            'image' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|max:4096',
            'show_on_home' => 'nullable|boolean',
            'store_type' => ['nullable', 'string', 'max:64', Rule::in($slugs)],
        ]);
    }

    private function resolveImage(Request $request, array $validated, ?string $fallback = null): ?string
    {
        $imageValue = $validated['image'] ?? $fallback;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('categories', 'public');
            $imageValue = Storage::url($path);
        }

        return $imageValue;
    }
}
