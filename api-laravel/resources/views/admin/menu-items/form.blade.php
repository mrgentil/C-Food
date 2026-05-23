@extends('layouts.app')

@section('title', $row ? 'Admin - Modifier article' : 'Admin - Nouvel article')

@section('content')
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ $row ? 'Modifier' : 'Créer' }} un article</h1>
        <p class="text-sm text-gray-600">Ajoute un plat / produit / médicament dans un établissement.</p>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6">
        <form method="POST"
              enctype="multipart/form-data"
              action="{{ $row ? route('admin.menuItems.update', $row) : route('admin.menuItems.store') }}">
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
                    <p class="mt-1 text-xs text-gray-500">Clique dans le champ et tape pour rechercher. Astuce: crée d’abord les sections dans “Sections du menu”.</p>
                </div>

                <div class="md:col-span-2">
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Section (optionnel)</label>
                    <select name="category_id" data-searchable="1" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">
                        <option value="">—</option>
                        @foreach($menuCategories as $c)
                            <option value="{{ $c->id }}" @selected(old('category_id', $menuCategoryId) == $c->id)>{{ $c->name }}</option>
                        @endforeach
                    </select>
                    @error('category_id')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Nom *</label>
                    <input name="name" required value="{{ old('name', $row->name ?? '') }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                    @error('name')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Prix (FC) *</label>
                    <input name="price" type="number" min="0" step="1" required value="{{ old('price', $row->price ?? '') }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500" />
                    @error('price')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div class="md:col-span-2">
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Libellé catégorie (mobile) *</label>
                    <input name="category" required value="{{ old('category', $row->category ?? '') }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                           placeholder="ex: Fruits & Légumes, Médicaments, Bières…" />
                    @error('category')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div class="md:col-span-2">
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Description</label>
                    <textarea name="description" rows="3" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500">{{ old('description', $row->description ?? '') }}</textarea>
                </div>

                <div class="md:col-span-2">
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Image (URL)</label>
                    <input name="image" value="{{ old('image', $row->image ?? '') }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                           placeholder="https://..." />
                    @error('image')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div class="md:col-span-2">
                    <label class="mb-1 block text-sm font-semibold text-gray-700">Ou upload image</label>
                    <input type="file" name="image_file" accept="image/*" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
                    @error('image_file')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    @if($row && $row->image)
                        <div class="mt-3 flex items-center gap-3">
                            <img src="{{ $row->image }}" class="h-14 w-14 rounded-lg object-cover border" alt="">
                            <div class="text-xs text-gray-500">Image actuelle</div>
                        </div>
                    @endif
                </div>

                <div class="md:col-span-2 flex flex-wrap gap-4">
                    <label class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input type="checkbox" name="is_available" value="1" class="rounded border-gray-300"
                               @checked(old('is_available', $row ? (int) $row->is_available : 1) == 1) />
                        Disponible
                    </label>
                    <label class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input type="checkbox" name="is_popular" value="1" class="rounded border-gray-300"
                               @checked(old('is_popular', $row ? (int) $row->is_popular : 0) == 1) />
                        Populaire
                    </label>
                    <label class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input type="checkbox" name="is_veg" value="1" class="rounded border-gray-300"
                               @checked(old('is_veg', $row ? (int) $row->is_veg : 0) == 1) />
                        Veg
                    </label>
                    <label class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input type="checkbox" name="is_spicy" value="1" class="rounded border-gray-300"
                               @checked(old('is_spicy', $row ? (int) $row->is_spicy : 0) == 1) />
                        Epicé
                    </label>
                </div>
            </div>

            <div class="mt-6 flex items-center gap-3">
                <button class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600" type="submit">
                    Enregistrer
                </button>
                <a class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                   href="{{ route('admin.menuItems', ['restaurant_id' => old('restaurant_id', $restaurantId), 'category_id' => old('category_id', $menuCategoryId)]) }}">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection

