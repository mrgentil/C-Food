<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Support\AdminHtmx;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminBrandWebController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->string('q'));
        $perPage = (int) ($request->integer('per_page') ?: 30);
        if ($perPage < 5) $perPage = 5;
        if ($perPage > 100) $perPage = 100;

        $query = Brand::query()->orderBy('order_index')->orderBy('name');

        if ($q !== '') {
            $query->where('name', 'like', '%'.$q.'%');
        }

        $brands = $query->paginate($perPage)->withQueryString();

        return AdminHtmx::list(
            $request,
            'admin.brands.index',
            'admin.partials.brands-list',
            compact('brands')
        );
    }

    public function create()
    {
        return view('admin.brands.form', [
            'brand' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateBrand($request);
        $logoValue = $this->resolveLogo($request, $validated);

        Brand::create([
            'name' => $validated['name'],
            'type' => $validated['type'] ?? 'supermarket',
            'logo' => $logoValue,
            'status' => (bool) ($validated['status'] ?? true),
            'order_index' => (int) ($validated['order_index'] ?? 0),
        ]);

        return redirect()->route('admin.brands')->with('success', 'Marque créée avec succès.');
    }

    public function edit(Brand $brand)
    {
        return view('admin.brands.form', [
            'brand' => $brand,
        ]);
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $this->validateBrand($request);
        $logoValue = $this->resolveLogo($request, $validated, $brand->logo);

        $brand->update([
            'name' => $validated['name'],
            'type' => $validated['type'] ?? 'supermarket',
            'logo' => $logoValue,
            'status' => (bool) ($validated['status'] ?? true),
            'order_index' => (int) ($validated['order_index'] ?? 0),
        ]);

        return redirect()->route('admin.brands')->with('success', 'Marque mise à jour avec succès.');
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();
        return redirect()->route('admin.brands')->with('success', 'Marque supprimée avec succès.');
    }

    private function validateBrand(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'logo' => 'nullable|string|max:255',
            'logo_file' => 'nullable|image|max:4096',
            'status' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
        ]);
    }

    private function resolveLogo(Request $request, array $validated, ?string $fallback = null): ?string
    {
        $logoValue = $validated['logo'] ?? $fallback;
        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('brands', 'public');
            $logoValue = Storage::url($path);
        }
        return $logoValue;
    }
}
