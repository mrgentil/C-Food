@extends('layouts.app')

@section('title', $row ? 'Admin - Modifier section' : 'Admin - Nouvelle section')

@section('content')
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ $row ? 'Modifier' : 'Créer' }} une section</h1>
        <p class="text-sm text-gray-600">Une section est un onglet dans un établissement (ex: Boissons, Médicaments…).</p>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6">
        <form method="POST" action="{{ $row ? route('admin.menuCategories.update', $row) : route('admin.menuCategories.store') }}">
            @csrf
            @if($row) @method('PUT') @endif

            <div class="grid gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Établissement *</label>
                    <select name="restaurant_id" data-searchable="1" data-placeholder="Rechercher un établissement…" required class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">
                        @foreach($restaurants as $r)
                            <option value="{{ $r->id }}" @selected(old('restaurant_id', $restaurantId) == $r->id)>{{ $r->name }} ({{ $r->type }})</option>
                        @endforeach
                    </select>
                    @error('restaurant_id')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    <p class="mt-1 text-xs text-gray-500">Clique dans le champ et tape pour rechercher.</p>
                </div>

                <div>
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Nom *</label>
                    <input name="name" required value="{{ old('name', $row->name ?? '') }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                           placeholder="ex: Boissons" />
                    @error('name')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Ordre</label>
                    <input name="sort_order" type="number" min="0" max="999" value="{{ old('sort_order', $row->sort_order ?? 0) }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                    @error('sort_order')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div class="md:col-span-2">
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Description</label>
                    <input name="description" value="{{ old('description', $row->description ?? '') }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                           placeholder="Optionnel" />
                    @error('description')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div class="md:col-span-2">
                    <label class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input type="checkbox" name="is_available" value="1" class="rounded border-gray-300"
                               @checked(old('is_available', $row ? (int) $row->is_available : 1) == 1) />
                        Actif
                    </label>
                </div>
            </div>

            <div class="mt-6 flex items-center gap-3">
                <button class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600" type="submit">
                    Enregistrer
                </button>
                <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                   href="{{ route('admin.menuCategories', ['restaurant_id' => old('restaurant_id', $restaurantId)]) }}">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection

