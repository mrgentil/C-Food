@extends('layouts.app')

@section('header')
    <x-admin.page-header title="Onglets application" subtitle="Barre horizontale sur l'accueil (Épicerie, Pharmacie…). Le slug = type d'établissement.">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.appTabs.create')" variant="primary">Ajouter un onglet</x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    <div class="admin-card overflow-hidden">
        <div class="admin-card-header px-6 py-4">
            <div class="admin-list-head">
                <p class="text-sm text-slate-500">Gestion des onglets de navigation mobile.</p>
                <x-admin.live-form :url="route('admin.appTabs')" target="app-tabs-list">
                    <x-admin.search placeholder="Nom ou slug…" />
                    @php($pp = (string) request('per_page', '30'))
                    <select name="per_page" class="admin-select w-auto">
                        @foreach(['10','20','30','50'] as $v)
                            <option value="{{ $v }}" @selected($pp === $v)>{{ $v }}/page</option>
                        @endforeach
                    </select>
                    <x-admin.button type="button" variant="secondary" data-live-reset>Réinitialiser</x-admin.button>
                </x-admin.live-form>
            </div>
        </div>
        @include('admin.partials.app-tabs-list')
    </div>
@endsection
