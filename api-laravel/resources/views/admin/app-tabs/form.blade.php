@extends('layouts.app')

@section('header')
    <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ $tab ? 'Modifier onglet' : 'Créer onglet' }}</h1>
            <p class="text-sm text-gray-500 mt-1">Slug = type API des établissements (ex. grocery, pharmacy).</p>
        </div>
        <a href="{{ route('admin.appTabs') }}" class="text-sm font-medium text-gray-700 hover:text-gray-900">Retour</a>
    </div>
@endsection

@section('content')
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <form method="POST" action="{{ $tab ? route('admin.appTabs.update', $tab) : route('admin.appTabs.store') }}">
            @csrf
            @if($tab) @method('PUT') @endif

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom affiché</label>
                <input name="name" value="{{ old('name', $tab->name ?? '') }}" required
                       class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                @error('name') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug (type établissement)</label>
                <input name="slug" value="{{ old('slug', $tab->slug ?? '') }}" required
                       @if($tab?->is_home_tab) readonly @endif
                       placeholder="ex: bakery"
                       class="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono" />
                <p class="text-xs text-gray-500 mt-1">Lettres, chiffres, tirets. Utilisé pour filtrer les magasins.</p>
                @error('slug') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Icône Ionicons</label>
                <input name="icon" value="{{ old('icon', $tab->icon ?? '') }}"
                       placeholder="ex: cart-outline"
                       class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                @error('icon') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Ordre d’affichage</label>
                <input type="number" name="sort_order" min="0" max="9999"
                       value="{{ old('sort_order', $tab->sort_order ?? 0) }}"
                       class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                @error('sort_order') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4 flex items-center gap-2">
                <input type="hidden" name="is_published" value="0" />
                <input type="checkbox" name="is_published" value="1" id="is_published"
                       @checked(old('is_published', $tab->is_published ?? true))
                       @if($tab?->is_home_tab) disabled checked @endif
                       class="rounded border-gray-300 text-orange-600" />
                <label for="is_published" class="text-sm text-gray-700">Publié (visible dans l’app)</label>
            </div>

            <div class="mb-6 flex items-center gap-2">
                <input type="hidden" name="is_home_tab" value="0" />
                <input type="checkbox" name="is_home_tab" value="1" id="is_home_tab"
                       @checked(old('is_home_tab', $tab->is_home_tab ?? false))
                       class="rounded border-gray-300 text-orange-600" />
                <label for="is_home_tab" class="text-sm text-gray-700">Onglet accueil (reste sur la home, ne ouvre pas une liste)</label>
            </div>

            <button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                {{ $tab ? 'Enregistrer' : 'Créer' }}
            </button>
        </form>
    </div>
@endsection
