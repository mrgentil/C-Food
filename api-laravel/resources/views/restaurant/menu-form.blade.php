@extends('layouts.restaurant')

@section('page-title', $menuItem ? 'Modifier l\'article' : 'Ajouter un article')

@section('page-content')
<div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-6">{{ $menuItem ? 'Modifier' : 'Ajouter' }} un article</h2>

        <form method="POST"
              enctype="multipart/form-data"
              action="{{ $menuItem ? route('restaurant.menu.update', $menuItem->id) : route('restaurant.menu.store') }}">
            @csrf
            @if($menuItem)
                @method('PUT')
            @endif

            @if(!$menuItem)
                @if(isset($restaurants) && $restaurants->count() > 1)
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Établissement *</label>
                        <select name="restaurant_id" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                            @foreach($restaurants as $r)
                                <option value="{{ $r->id }}" @selected(old('restaurant_id', $selectedRestaurantId) == $r->id)>
                                    {{ $r->name }} ({{ $r->type }})
                                </option>
                            @endforeach
                        </select>
                        @error('restaurant_id')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                @else
                    <input type="hidden" name="restaurant_id" value="{{ old('restaurant_id', $selectedRestaurantId) }}">
                @endif
            @endif

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input type="text" name="name" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                       value="{{ old('name', $menuItem->name ?? '') }}">
                @error('name')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea name="description" rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">{{ old('description', $menuItem->description ?? '') }}</textarea>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Prix (FC) *</label>
                    <input type="number" name="price" min="0" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                           value="{{ old('price', $menuItem->price ?? '') }}">
                    @error('price')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                    <input type="text" name="category" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                           value="{{ old('category', $menuItem->category ?? '') }}"
                           placeholder="ex: Burgers, Desserts, Boissons">
                    @error('category')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Image (URL)</label>
                <input type="text" name="image"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                       value="{{ old('image', $menuItem->image ?? '') }}"
                       placeholder="https://...">
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Ou upload image</label>
                <input type="file" name="image_file" accept="image/*"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500">
                @error('image_file')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror

                @if($menuItem && $menuItem->image)
                    <div class="mt-3 flex items-center gap-3">
                        <img src="{{ $menuItem->image }}" alt="" class="h-14 w-14 rounded-lg object-cover border border-gray-200">
                        <div class="text-xs text-gray-500">Image actuelle</div>
                    </div>
                @endif
            </div>

            <div class="mb-6 border-t border-gray-200 pt-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Options & État</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" name="is_available" value="1" class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                               @checked(old('is_available', $menuItem->is_available ?? true))>
                        <span class="text-sm font-medium text-gray-700">En stock (Disponible)</span>
                    </label>

                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" name="is_popular" value="1" class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                               @checked(old('is_popular', $menuItem->is_popular ?? false))>
                        <span class="text-sm font-medium text-gray-700">🔥 Populaire (Coup de cœur)</span>
                    </label>

                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" name="is_veg" value="1" class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                               @checked(old('is_veg', $menuItem->is_veg ?? false))>
                        <span class="text-sm font-medium text-gray-700">🌱 Végétarien</span>
                    </label>

                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" name="is_spicy" value="1" class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                               @checked(old('is_spicy', $menuItem->is_spicy ?? false))>
                        <span class="text-sm font-medium text-gray-700">🌶️ Épicé</span>
                    </label>
                </div>
            </div>

            <div class="flex space-x-4">
                <button type="submit"
                        class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg">
                    {{ $menuItem ? 'Mettre à jour' : 'Ajouter' }}
                </button>
                <a href="{{ route('restaurant.menu') }}"
                   class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">
                    Annuler
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
