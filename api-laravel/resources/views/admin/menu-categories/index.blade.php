@extends('layouts.app')

@section('title', 'Admin - Sections Menu')

@section('header')
    <x-admin.page-header title="Sections du menu" subtitle="Boissons, médicaments, fruits & légumes… par établissement.">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.menuCategories.create', ['restaurant_id' => $restaurantId])" variant="primary">+ Ajouter</x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    <div class="admin-card overflow-hidden mb-6">
        <div class="admin-card-header px-6 py-4">
            <x-admin.live-form :url="route('admin.menuCategories')" target="menu-categories-list" class="admin-filter-toolbar md:grid md:grid-cols-3 gap-3 w-full">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Établissement</label>
                    <select name="restaurant_id" data-searchable="1" class="admin-select text-sm w-full">
                        <option value="">Tous</option>
                        @foreach($restaurants as $r)
                            <option value="{{ $r->id }}" @selected($restaurantId == $r->id)>{{ $r->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Recherche</label>
                    <x-admin.search placeholder="Nom section…" :value="$q" class="admin-search-field !max-w-none w-full" />
                </div>
                <div class="flex items-end">
                    <x-admin.button type="button" variant="secondary" data-live-reset class="w-full">Réinitialiser</x-admin.button>
                </div>
            </x-admin.live-form>
        </div>
        @include('admin.partials.menu-categories-list')
    </div>
@endsection
