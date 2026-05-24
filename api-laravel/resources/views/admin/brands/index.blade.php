@extends('layouts.app')

@section('header')
    <x-admin.page-header
        title="Marques (Brands)"
        subtitle="Gestion des marques disponibles dans l'application">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.brands.create')" variant="primary">Ajouter une marque</x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    <div class="admin-card overflow-hidden">
        <div class="admin-card-header px-6 py-4 space-y-4">
            <div class="admin-list-head">
                <p class="text-sm text-dark-muted">Tapez un nom pour filtrer instantanément.</p>
                <x-admin.live-form :url="route('admin.brands')" target="brands-list">
                    <x-admin.search placeholder="Nom de la marque…" />
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
        @include('admin.partials.brands-list')
    </div>
@endsection
