@extends('layouts.app')

@section('title', 'Admin - Articles Menu')

@section('header')
    <x-admin.page-header title="Articles du menu" subtitle="Plats, médicaments et produits par établissement.">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.menuItems.create', ['restaurant_id' => $restaurantId, 'category_id' => $menuCategoryId])" variant="primary">+ Ajouter</x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    <div class="admin-card overflow-hidden mb-6">
        <div class="admin-card-header px-6 py-4">
            <x-admin.live-form :url="route('admin.menuItems')" target="menu-items-list" class="admin-filter-toolbar !flex-wrap md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
                <div class="lg:col-span-2">
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Établissement</label>
                    <select name="restaurant_id" data-searchable="1" class="admin-select text-sm w-full">
                        <option value="">Tous</option>
                        @foreach($restaurants as $r)
                            <option value="{{ $r->id }}" @selected($restaurantId == $r->id)>{{ $r->name }} ({{ $r->type }})</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Section</label>
                    <select name="category_id" data-searchable="1" class="admin-select text-sm w-full">
                        <option value="">Toutes</option>
                        @foreach($menuCategories as $c)
                            <option value="{{ $c->id }}" @selected($menuCategoryId == $c->id)>{{ $c->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Recherche</label>
                    <x-admin.search placeholder="Nom article…" :value="$q" class="admin-search-field !max-w-none w-full" />
                </div>
                <div class="flex items-end gap-2">
                    <x-admin.button type="button" variant="secondary" data-live-reset class="w-full">Réinitialiser</x-admin.button>
                </div>
            </x-admin.live-form>
        </div>
        @include('admin.partials.menu-items-list')
    </div>
@endsection
