@extends('layouts.app')

@section('header')
    <x-admin.page-header title="Promos" subtitle="Codes promo utilisés dans l'app mobile (checkout).">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.promos.create')" variant="primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Nouveau code
            </x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    <div class="admin-card overflow-hidden">
        <div class="admin-card-header px-6 py-4">
            <div class="admin-list-head">
                <div class="min-w-0">
                    <h3 class="text-base font-semibold text-slate-900">Codes promo</h3>
                    <p class="text-sm text-slate-500 mt-0.5">Recherche par code en temps réel.</p>
                </div>
                <x-admin.live-form :url="route('admin.promos')" target="promos-list">
                    <x-admin.search placeholder="Code promo…" />
                    @php($type = request('type'))
                    <select name="type" class="admin-select w-auto">
                        <option value="" @selected(!$type)>Tous types</option>
                        <option value="percent" @selected($type==='percent')>%</option>
                        <option value="fixed" @selected($type==='fixed')>Fixe</option>
                    </select>
                    @php($active = request('active'))
                    <select name="active" class="admin-select w-auto">
                        <option value="" @selected($active==='')>Actif/off</option>
                        <option value="1" @selected($active==='1')>Actif</option>
                        <option value="0" @selected($active==='0')>Off</option>
                    </select>
                    @php($pp = (string) request('per_page', '20'))
                    <select name="per_page" class="admin-select w-auto">
                        @foreach(['10','20','30','50','100'] as $v)
                            <option value="{{ $v }}" @selected($pp === $v)>{{ $v }}/page</option>
                        @endforeach
                    </select>
                    <x-admin.button type="button" variant="secondary" data-live-reset>Réinitialiser</x-admin.button>
                </x-admin.live-form>
            </div>
        </div>
        @include('admin.partials.promos-list')
    </div>
@endsection
