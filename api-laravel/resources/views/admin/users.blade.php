@extends('layouts.app')

@section('header')
    <x-admin.page-header title="Utilisateurs" subtitle="Clients, marchands, livreurs et administrateurs.">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.users.create')" variant="primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Ajouter
            </x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    <div class="admin-card overflow-hidden">
        <div class="admin-card-header px-6 py-4">
            <div class="admin-list-head">
                <div class="min-w-0">
                    <h3 class="text-base font-semibold text-slate-900">Tous les utilisateurs</h3>
                    <p class="text-sm text-slate-500 mt-0.5">Tapez pour filtrer — pas besoin d'appuyer sur Entrée.</p>
                </div>
                <x-admin.live-form :url="route('admin.users')" target="users-list">
                    <x-admin.search placeholder="Nom / email / téléphone…" />
                    @php($role = request('role'))
                    <select name="role" class="admin-select w-auto min-w-[9rem]">
                        <option value="" @selected(!$role)>Tous rôles</option>
                        <option value="client" @selected($role==='client')>Client</option>
                        <option value="merchant" @selected($role==='merchant')>Marchand</option>
                        <option value="driver" @selected($role==='driver')>Livreur</option>
                        <option value="admin" @selected($role==='admin')>Admin</option>
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
        @include('admin.partials.users-list')
    </div>
@endsection
