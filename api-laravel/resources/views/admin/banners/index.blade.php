@extends('layouts.app')

@section('header')
    <x-admin.page-header
        title="Publicités (Bannières)"
        subtitle="Gérez les bannières publicitaires affichées dans l'application">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.banners.create')" variant="primary">Ajouter une publicité</x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    <div class="admin-card overflow-hidden">
        <div class="admin-card-header px-6 py-4 space-y-4">
            <div class="admin-list-head">
                <p class="text-sm text-dark-muted">Tapez un titre pour filtrer instantanément.</p>
                <x-admin.live-form :url="route('admin.banners')" target="banners-list">
                    <x-admin.search placeholder="Titre de la publicité…" />
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
        @include('admin.partials.banners-list')
    </div>
@endsection
