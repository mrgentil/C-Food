@extends('layouts.app')

@section('header')
    <x-admin.page-header
        :title="($scope ?? 'home') === 'tags' ? 'Tags établissements' : 'Filtres page d\'accueil'"
        :subtitle="($scope ?? 'home') === 'tags' ? 'Étiquettes internes (Médicaments, Fruits…)' : 'Icônes Pizza, Burger, Africain… sous les promos.'">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.categories.create', ['scope' => $scope ?? 'home'])" variant="primary">Ajouter</x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    <div class="admin-card overflow-hidden">
        <div class="admin-card-header px-6 py-4 space-y-4">
            <div class="flex flex-wrap gap-2" data-live-ignore>
                <a href="{{ route('admin.categories', ['scope' => 'home']) }}"
                   class="px-3 py-1.5 rounded-lg text-sm font-medium {{ ($scope ?? 'home') === 'home' ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-700' }}">Filtres accueil</a>
                <a href="{{ route('admin.categories', ['scope' => 'tags']) }}"
                   class="px-3 py-1.5 rounded-lg text-sm font-medium {{ ($scope ?? 'home') === 'tags' ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-700' }}">Tags établissements</a>
                <a href="{{ route('admin.categories', ['scope' => 'all']) }}"
                   class="px-3 py-1.5 rounded-lg text-sm font-medium {{ ($scope ?? 'home') === 'all' ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-700' }}">Tout voir</a>
            </div>
            <div class="admin-list-head">
                <p class="text-sm text-slate-500">Tapez un nom pour filtrer instantanément.</p>
                <x-admin.live-form :url="route('admin.categories')" target="categories-list">
                    <input type="hidden" name="scope" value="{{ $scope ?? 'home' }}" />
                    <x-admin.search placeholder="Nom catégorie…" />
                    @php($pp = (string) request('per_page', '30'))
                    <select name="per_page" class="admin-select w-auto">
                        @foreach(['10','20','30','50','100'] as $v)
                            <option value="{{ $v }}" @selected($pp === $v)>{{ $v }}/page</option>
                        @endforeach
                    </select>
                    <x-admin.button type="button" variant="secondary" data-live-reset>Réinitialiser</x-admin.button>
                </x-admin.live-form>
            </div>
        </div>
        @include('admin.partials.categories-list')
    </div>
@endsection
