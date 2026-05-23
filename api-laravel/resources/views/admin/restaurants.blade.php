@extends('layouts.app')

@section('header')
    <x-admin.page-header title="Établissements" subtitle="Restaurants, pharmacies, épiceries, fleurs et autres types.">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.restaurants.create')" variant="primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Ajouter
            </x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    @php($typeLabels = [
        'restaurant' => 'Restaurant',
        'grocery' => 'Épicerie',
        'supermarket' => 'Supermarché',
        'alcohol' => 'Alcool',
        'flowers' => 'Fleurs',
        'pharmacy' => 'Pharmacie',
        'pet' => 'Animalerie',
    ])

    <div class="admin-card overflow-hidden">
        <div class="admin-card-header px-6 py-4">
            <div class="admin-list-head">
                <div class="min-w-0">
                    <h3 class="text-base font-semibold text-slate-900">Liste des établissements</h3>
                    <p class="text-sm text-slate-500 mt-0.5">Filtres mis à jour en temps réel.</p>
                </div>
                <x-admin.live-form :url="route('admin.restaurants')" target="restaurants-list">
                    <x-admin.search placeholder="Nom établissement…" />
                    <input type="hidden" name="owner_user_id" value="{{ request('owner_user_id') }}" />
                    @php($type = request('type'))
                    <select name="type" class="admin-select w-auto">
                        <option value="">Tous types</option>
                        @foreach(['restaurant','grocery','supermarket','alcohol','flowers','pharmacy','pet'] as $t)
                            <option value="{{ $t }}" @selected($type===$t)>{{ $typeLabels[$t] ?? $t }}</option>
                        @endforeach
                    </select>
                    @php($open = request('open'))
                    <select name="open" class="admin-select w-auto">
                        <option value="">Ouvert / fermé</option>
                        <option value="1" @selected($open==='1')>Ouvert</option>
                        <option value="0" @selected($open==='0')>Fermé</option>
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
        @include('admin.partials.restaurants-list')
    </div>
@endsection
