@extends('layouts.app')

@section('header')
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ $promo ? 'Éditer un code' : 'Nouveau code promo' }}</h1>
            <p class="text-sm text-gray-500">Utilisé par l’app mobile (checkout).</p>
        </div>
        <a href="{{ route('admin.promos') }}" class="text-gray-600 hover:text-gray-900 font-semibold">← Retour</a>
    </div>
@endsection

@section('content')
    <form method="POST" action="{{ $promo ? route('admin.promos.update', $promo) : route('admin.promos.store') }}"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
        @csrf
        @if($promo)
            @method('PUT')
        @endif

        @if($errors->any())
            <div class="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <ul class="list-disc ml-5">
                    @foreach($errors->all() as $e)
                        <li>{{ $e }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Code</label>
                <input name="code" value="{{ old('code', $promo->code ?? '') }}"
                       class="w-full border rounded-lg px-3 py-2" placeholder="WELCOME10" required />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Portée</label>
                <select name="restaurant_id" data-searchable="1" data-placeholder="Global ou établissement…" class="w-full border rounded-lg px-3 py-2">
                    <option value="">Global (tous établissements)</option>
                    @foreach(($restaurants ?? []) as $r)
                        <option value="{{ $r->id }}" @selected(old('restaurant_id', $promo->restaurant_id ?? '') == $r->id)>{{ $r->name }} ({{ $r->type }})</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Actif</label>
                <select name="is_active" data-searchable="1" data-placeholder="Oui / Non" class="w-full border rounded-lg px-3 py-2">
                    <option value="1" {{ old('is_active', ($promo->is_active ?? false) ? 1 : 0) == 1 ? 'selected' : '' }}>Oui</option>
                    <option value="0" {{ old('is_active', ($promo->is_active ?? false) ? 1 : 0) == 0 ? 'selected' : '' }}>Non</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <select name="type" data-searchable="1" data-placeholder="Type…" class="w-full border rounded-lg px-3 py-2">
                    <option value="percent" {{ old('type', $promo->type ?? 'percent') === 'percent' ? 'selected' : '' }}>%</option>
                    <option value="fixed" {{ old('type', $promo->type ?? 'percent') === 'fixed' ? 'selected' : '' }}>Montant (FC)</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Valeur</label>
                <input name="value" type="number" min="1" value="{{ old('value', $promo->value ?? 10) }}"
                       class="w-full border rounded-lg px-3 py-2" required />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Sous-total minimum (FC)</label>
                <input name="min_subtotal" type="number" min="0" value="{{ old('min_subtotal', $promo->min_subtotal ?? 0) }}"
                       class="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Max utilisations (optionnel)</label>
                <input name="max_uses" type="number" min="1" value="{{ old('max_uses', $promo->max_uses ?? '') }}"
                       class="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Début</label>
                <input name="starts_at" type="date"
                       value="{{ old('starts_at', $promo && $promo->starts_at ? $promo->starts_at->format('Y-m-d') : '') }}"
                       class="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Expiration</label>
                <input name="expires_at" type="date"
                       value="{{ old('expires_at', $promo && $promo->expires_at ? $promo->expires_at->format('Y-m-d') : '') }}"
                       class="w-full border rounded-lg px-3 py-2" />
            </div>
        </div>

        <div class="mt-6 flex items-center gap-3">
            <button type="submit" class="px-5 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">
                {{ $promo ? 'Enregistrer' : 'Créer' }}
            </button>
            <a href="{{ route('admin.promos') }}" class="px-5 py-2 border rounded-lg font-semibold text-gray-700 hover:bg-gray-50">
                Annuler
            </a>
        </div>
    </form>
@endsection

