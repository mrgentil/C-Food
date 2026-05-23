@extends('layouts.app')

@section('header')
    <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ $category ? 'Modifier rubrique' : 'Créer rubrique' }}</h1>
            <p class="text-sm text-gray-500 mt-1">Filtre accueil (Pizza, Burger…) ou tag pour un type de magasin.</p>
        </div>
        <a href="{{ route('admin.categories') }}" class="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Retour
        </a>
    </div>
@endsection

@section('content')
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <form method="POST" action="{{ $category ? route('admin.categories.update', $category) : route('admin.categories.store') }}" enctype="multipart/form-data">
            @csrf
            @if($category) @method('PUT') @endif

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input name="name" value="{{ old('name', $category->name ?? '') }}"
                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                       required />
                @error('name') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4 flex items-start gap-2">
                <input type="hidden" name="show_on_home" value="0" />
                <input type="checkbox" name="show_on_home" value="1" id="show_on_home"
                       @checked(old('show_on_home', $category->show_on_home ?? (($defaultScope ?? 'home') === 'home')))
                       class="mt-1 rounded border-gray-300 text-orange-600" />
                <div>
                    <label for="show_on_home" class="text-sm font-medium text-gray-700">Afficher sur la page d’accueil</label>
                    <p class="text-xs text-gray-500 mt-0.5">Section « Catégories » sous les promos (Pizza, Africain…).</p>
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Type d’établissement lié</label>
                <select name="store_type" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    @foreach(($storeTypes ?? []) as $slug => $label)
                        <option value="{{ $slug }}" @selected(old('store_type', $category->store_type ?? 'restaurant') === $slug)>{{ $label }} ({{ $slug }})</option>
                    @endforeach
                </select>
                <p class="text-xs text-gray-500 mt-1">Pour les tags magasins (ex. Médicaments → pharmacie). Restaurants pour les filtres accueil.</p>
                @error('store_type') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Icône Ionicons (optionnel)</label>
                <input name="icon" value="{{ old('icon', $category->icon ?? '') }}"
                       placeholder="ex: 🍔 ou 'food'"
                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                @error('icon') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Couleur (hex)</label>
                <div class="flex items-center gap-3">
                    <input name="color" value="{{ old('color', $category->color ?? '#6B7280') }}"
                           class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    <span class="inline-block w-10 h-10 rounded-lg border border-gray-200"
                          style="background: {{ old('color', $category->color ?? '#6B7280') }}"></span>
                </div>
                @error('color') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (URL optionnel)</label>
                <input name="image" value="{{ old('image', $category->image ?? '') }}"
                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                @error('image') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                <div class="mt-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ou uploader un fichier</label>
                    <input type="file" name="image_file" accept="image/*"
                           class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                    @error('image_file') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                    @if($category?->image)
                        <div class="mt-3 flex items-center gap-3">
                            <img src="{{ $category->image }}" alt="" class="h-12 w-12 rounded-lg object-cover border border-gray-200" />
                            <p class="text-xs text-gray-500">Aperçu actuel</p>
                        </div>
                    @endif
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button class="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm" type="submit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {{ $category ? 'Enregistrer' : 'Créer' }}
                </button>
                <a href="{{ route('admin.categories') }}" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-900 shadow-sm">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection

