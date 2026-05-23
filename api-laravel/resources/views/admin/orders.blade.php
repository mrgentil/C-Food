@extends('layouts.app')

@section('header')
    <x-admin.page-header title="Commandes" subtitle="Suivi et gestion de toutes les commandes plateforme." />
@endsection

@section('content')
    @php($statusLabels = [
        'pending' => 'En attente',
        'preparing' => 'Préparation',
        'picked_up' => 'Récupérée',
        'delivering' => 'En route',
        'delivered' => 'Livrée',
        'cancelled' => 'Annulée',
    ])

    <div class="admin-card overflow-hidden">
        <div class="admin-card-header px-6 py-4">
            <div class="admin-list-head">
                <div class="min-w-0">
                    <h3 class="text-base font-semibold text-slate-900">Toutes les commandes</h3>
                    <p class="text-sm text-slate-500 mt-0.5">Recherche instantanée par client ou n° de commande.</p>
                </div>
                <x-admin.live-form :url="route('admin.orders')" target="orders-list">
                    <x-admin.search placeholder="Client, n° commande…" />
                    @php($st = request('status'))
                    <select name="status" class="admin-select w-auto min-w-[10rem]">
                        <option value="">Tous statuts</option>
                        @foreach(['pending','preparing','picked_up','delivering','delivered','cancelled'] as $s)
                            <option value="{{ $s }}" @selected($st === $s)>{{ $statusLabels[$s] ?? $s }}</option>
                        @endforeach
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
        @include('admin.partials.orders-list')
    </div>
@endsection
