@extends('layouts.app')

@section('header')
    <div class="flex items-center gap-4">
        <a href="{{ route('admin.brands') }}" class="p-2 rounded-lg text-dark-muted hover:bg-dark-bg hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </a>
        <x-admin.page-header
            :title="$brand ? 'Modifier la marque : ' . $brand->name : 'Nouvelle marque'"
            :subtitle="$brand ? 'Modifiez les informations de cette marque.' : 'Ajoutez une nouvelle marque.'">
        </x-admin.page-header>
    </div>
@endsection

@section('content')
    <form action="{{ $brand ? route('admin.brands.update', $brand) : route('admin.brands.store') }}" method="POST" enctype="multipart/form-data" class="max-w-3xl space-y-6">
        @csrf
        @if($brand) @method('PUT') @endif

        <x-admin.card padding>
            <div class="space-y-6">
                <!-- Name -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="name">Nom de la marque</label>
                    <input type="text" name="name" id="name" required
                           value="{{ old('name', $brand->name ?? '') }}"
                           class="admin-input" placeholder="Ex: Shoprite">
                    @error('name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Type -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="type">Type d'établissement</label>
                    <select name="type" id="type" required class="admin-select">
                        <option value="supermarket" @selected(old('type', $brand->type ?? '') === 'supermarket')>Supermarché</option>
                        <option value="restaurant" @selected(old('type', $brand->type ?? '') === 'restaurant')>Restaurant</option>
                        <option value="pharmacy" @selected(old('type', $brand->type ?? '') === 'pharmacy')>Pharmacie</option>
                        <option value="bakery" @selected(old('type', $brand->type ?? '') === 'bakery')>Boulangerie / Pâtisserie</option>
                        <option value="cosmetics" @selected(old('type', $brand->type ?? '') === 'cosmetics')>Cosmétiques</option>
                        <option value="electronics" @selected(old('type', $brand->type ?? '') === 'electronics')>Électronique</option>
                        <option value="liquor" @selected(old('type', $brand->type ?? '') === 'liquor')>Cave à Liqueurs / Alcool</option>
                        <option value="florist" @selected(old('type', $brand->type ?? '') === 'florist')>Fleuriste</option>
                    </select>
                    @error('type') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Logo File -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="logo_file">Logo (Fichier Image)</label>
                    @if($brand && $brand->logo)
                        <div class="mb-3">
                            <p class="text-xs text-dark-muted mb-1">Logo actuel :</p>
                            <img src="{{ $brand->logo }}" alt="{{ $brand->name }}" class="h-16 object-contain bg-white rounded-lg p-2">
                        </div>
                    @endif
                    <input type="file" name="logo_file" id="logo_file" accept="image/*" class="admin-input">
                    <p class="text-xs text-dark-muted mt-1">Laissez vide pour conserver l'ancien logo. Taille max: 4Mo.</p>
                    @error('logo_file') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Logo URL Fallback -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="logo">Ou URL du Logo</label>
                    <input type="url" name="logo" id="logo"
                           value="{{ old('logo', $brand->logo ?? '') }}"
                           class="admin-input" placeholder="https://example.com/logo.png">
                    @error('logo') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Order Index -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="order_index">Ordre d'affichage</label>
                    <input type="number" name="order_index" id="order_index"
                           value="{{ old('order_index', $brand->order_index ?? '0') }}"
                           class="admin-input" placeholder="0">
                    <p class="text-xs text-dark-muted mt-1">Un chiffre plus bas = affiché en premier.</p>
                    @error('order_index') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Status -->
                <div>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="status" value="1"
                               class="admin-checkbox"
                               @checked(old('status', $brand->status ?? true))>
                        <span class="text-sm font-medium text-white">Marque active</span>
                    </label>
                    <p class="text-xs text-dark-muted mt-1 ml-7">Décochez pour masquer la marque dans l'application.</p>
                    @error('status') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
            </div>
        </x-admin.card>

        <div class="flex gap-4 pt-4">
            <x-admin.button type="submit" variant="primary">
                {{ $brand ? 'Enregistrer les modifications' : 'Créer la marque' }}
            </x-admin.button>
            <x-admin.button :href="route('admin.brands')" variant="secondary">Annuler</x-admin.button>
        </div>
    </form>
@endsection
