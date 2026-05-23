@extends('layouts.app')

@section('header')
    <x-admin.page-header
        :title="$user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'"
        subtitle="Création de comptes clients, marchands et livreurs.">
        <x-slot name="actions">
            <x-admin.button :href="route('admin.users')" variant="ghost">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                Retour
            </x-admin.button>
        </x-slot>
    </x-admin.page-header>
@endsection

@section('content')
    <div class="{{ ($user && $user->is_driver) ? 'max-w-6xl' : 'max-w-3xl' }} mx-auto space-y-6">

        @if($user)
            <x-admin.card title="Réinitialiser le mot de passe" description="Définir un nouveau mot de passe sans modifier le reste du profil.">
                <form method="POST" action="{{ route('admin.users.resetPassword', $user) }}" class="space-y-4">
                    @csrf
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <x-admin.input label="Nouveau mot de passe" name="new_password" type="password" :required="true" autocomplete="new-password" />
                        <x-admin.input label="Confirmation" name="new_password_confirmation" type="password" :required="true" autocomplete="new-password" />
                    </div>
                    <div class="flex flex-wrap items-center gap-3 pt-2">
                        <x-admin.button type="submit" variant="primary">Réinitialiser</x-admin.button>
                        <p class="text-xs text-slate-500">L'utilisateur devra utiliser ce mot de passe au prochain login.</p>
                    </div>
                </form>
            </x-admin.card>
        @endif

        <x-admin.card :title="$user ? 'Profil utilisateur' : 'Nouveau compte'">
            <form method="POST" action="{{ $user ? route('admin.users.update', $user) : route('admin.users.store') }}" class="space-y-5">
                @csrf
                @if($user) @method('PUT') @endif

                <x-admin.input label="Nom complet" name="name" :value="$user->name ?? ''" :required="true" />
                <x-admin.input label="Email" name="email" type="email" :value="$user->email ?? ''" :required="true" />
                <x-admin.input label="Téléphone" name="phone" :value="$user->phone ?? ''" />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <x-admin.input
                        :label="$user ? 'Mot de passe (vide = inchangé)' : 'Mot de passe'"
                        name="password"
                        type="password"
                        :required="!$user"
                        autocomplete="new-password" />
                    <x-admin.input label="Confirmation mot de passe" name="password_confirmation" type="password" :required="!$user" autocomplete="new-password" />
                </div>

                <div class="rounded-xl border border-slate-200 bg-slate-50/80 p-5 space-y-3">
                    <p class="text-sm font-semibold text-slate-800">Rôles (accès application)</p>
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="roles_admin" value="1" class="admin-checkbox"
                               @checked(old('roles_admin', $user?->is_admin ?? false))>
                        <span class="text-sm text-slate-700 group-hover:text-slate-900">Administrateur (dashboard admin)</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="roles_restaurant" value="1" class="admin-checkbox"
                               @checked(old('roles_restaurant', ($user?->is_merchant ?? false) || ($user?->is_restaurant ?? false)))>
                        <span class="text-sm text-slate-700 group-hover:text-slate-900">Marchand (restaurant, pharmacie, etc.)</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="roles_driver" value="1" class="admin-checkbox"
                               @checked(old('roles_driver', $user?->is_driver ?? false))>
                        <span class="text-sm text-slate-700 group-hover:text-slate-900">Livreur (affectation livraisons)</span>
                    </label>
                </div>

                <div class="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                    <x-admin.button type="submit" variant="primary" size="lg">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        {{ $user ? 'Enregistrer' : 'Créer' }}
                    </x-admin.button>
                    <x-admin.button :href="route('admin.users')" variant="secondary" size="lg">Annuler</x-admin.button>
                </div>
            </form>
        </x-admin.card>

        @if($user && $user->is_driver)
            @include('admin.partials.driver-earnings', ['user' => $user, 'driverStats' => $driverStats ?? null])
            @include('admin.partials.driver-verification', ['user' => $user])
        @endif
    </div>
@endsection
