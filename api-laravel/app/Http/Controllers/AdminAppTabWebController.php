<?php

namespace App\Http\Controllers;

use App\Models\AppTab;
use App\Support\AdminHtmx;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminAppTabWebController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->string('q'));
        $perPage = (int) ($request->integer('per_page') ?: 30);
        if ($perPage < 5) {
            $perPage = 5;
        }
        if ($perPage > 100) {
            $perPage = 100;
        }

        $query = AppTab::query()->orderBy('sort_order')->orderBy('name');
        if ($q !== '') {
            $query->where(function ($qq) use ($q) {
                $qq->where('name', 'like', '%'.$q.'%')
                    ->orWhere('slug', 'like', '%'.$q.'%');
            });
        }

        $tabs = $query->paginate($perPage)->withQueryString();

        return AdminHtmx::list($request, 'admin.app-tabs.index', 'admin.partials.app-tabs-list', compact('tabs'));
    }

    public function create()
    {
        return view('admin.app-tabs.form', ['tab' => null]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateTab($request);

        AppTab::create($validated);

        return redirect()->route('admin.appTabs')->with('success', 'Onglet créé.');
    }

    public function edit(AppTab $appTab)
    {
        return view('admin.app-tabs.form', ['tab' => $appTab]);
    }

    public function update(Request $request, AppTab $appTab)
    {
        $validated = $this->validateTab($request, $appTab);

        $appTab->update($validated);

        return redirect()->route('admin.appTabs')->with('success', 'Onglet mis à jour.');
    }

    public function destroy(AppTab $appTab)
    {
        if ($appTab->is_home_tab) {
            return back()->with('error', 'L’onglet d’accueil (restaurants) ne peut pas être supprimé.');
        }

        $appTab->delete();

        return redirect()->route('admin.appTabs')->with('success', 'Onglet supprimé.');
    }

    public function togglePublish(AppTab $appTab)
    {
        if ($appTab->is_home_tab && $appTab->is_published) {
            return back()->with('error', 'L’onglet d’accueil doit rester publié.');
        }

        $appTab->update(['is_published' => ! $appTab->is_published]);

        $label = $appTab->is_published ? 'publié' : 'dépublié';

        return back()->with('success', "Onglet « {$appTab->name} » {$label}.");
    }

    private function validateTab(Request $request, ?AppTab $tab = null): array
    {
        $validated = $request->validate([
            'slug' => [
                'required',
                'string',
                'max:64',
                'alpha_dash',
                Rule::unique('app_tabs', 'slug')->ignore($tab?->id),
            ],
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:64',
            'sort_order' => 'nullable|integer|min:0|max:9999',
            'is_published' => 'nullable|boolean',
            'is_home_tab' => 'nullable|boolean',
        ]);

        $validated['sort_order'] = (int) ($validated['sort_order'] ?? 0);
        $validated['is_published'] = $request->boolean('is_published');
        $validated['is_home_tab'] = $request->boolean('is_home_tab');

        if ($validated['is_home_tab']) {
            AppTab::query()
                ->when($tab, fn ($q) => $q->where('id', '!=', $tab->id))
                ->update(['is_home_tab' => false]);
            $validated['is_published'] = true;
        }

        return $validated;
    }
}
