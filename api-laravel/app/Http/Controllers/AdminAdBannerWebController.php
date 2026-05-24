<?php

namespace App\Http\Controllers;

use App\Models\AdBanner;
use App\Support\AdminHtmx;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminAdBannerWebController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->string('q'));
        $perPage = (int) ($request->integer('per_page') ?: 30);
        if ($perPage < 5) $perPage = 5;
        if ($perPage > 100) $perPage = 100;

        $query = AdBanner::query()->orderBy('order_index')->orderBy('title');

        if ($q !== '') {
            $query->where('title', 'like', '%'.$q.'%');
        }

        $banners = $query->paginate($perPage)->withQueryString();

        return AdminHtmx::list(
            $request,
            'admin.banners.index',
            'admin.partials.banners-list',
            compact('banners')
        );
    }

    public function create()
    {
        return view('admin.banners.form', [
            'banner' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateBanner($request);
        $imageValue = $this->resolveImage($request, $validated);

        AdBanner::create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'image' => $imageValue,
            'color' => $validated['color'] ?? '#0EA5E9',
            'action_type' => $validated['action_type'] ?? null,
            'action_value' => $validated['action_value'] ?? null,
            'order_index' => (int) ($validated['order_index'] ?? 0),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->route('admin.banners')->with('success', 'Publicité créée avec succès.');
    }

    public function edit(AdBanner $banner)
    {
        return view('admin.banners.form', [
            'banner' => $banner,
        ]);
    }

    public function update(Request $request, AdBanner $banner)
    {
        $validated = $this->validateBanner($request);
        $imageValue = $this->resolveImage($request, $validated, $banner->image);

        $banner->update([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'image' => $imageValue,
            'color' => $validated['color'] ?? '#0EA5E9',
            'action_type' => $validated['action_type'] ?? null,
            'action_value' => $validated['action_value'] ?? null,
            'order_index' => (int) ($validated['order_index'] ?? 0),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->route('admin.banners')->with('success', 'Publicité mise à jour avec succès.');
    }

    public function destroy(AdBanner $banner)
    {
        $banner->delete();
        return redirect()->route('admin.banners')->with('success', 'Publicité supprimée avec succès.');
    }

    private function validateBanner(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'nullable|string|max:500',
            'image_file' => 'nullable|image|max:4096',
            'color' => 'nullable|string|max:20',
            'action_type' => 'nullable|string|in:restaurant,category,url,none',
            'action_value' => 'nullable|string|max:500',
            'order_index' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);
    }

    private function resolveImage(Request $request, array $validated, ?string $fallback = null): ?string
    {
        $imageValue = $validated['image'] ?? $fallback;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('banners', 'public');
            $imageValue = Storage::url($path);
        }
        return $imageValue;
    }
}
