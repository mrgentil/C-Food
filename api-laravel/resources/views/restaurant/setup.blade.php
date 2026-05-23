@extends('layouts.restaurant')

@section('page-title', 'Mon établissement')

@section('page-content')
<div class="max-w-5xl mx-auto">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-6">
            <div>
                <h2 class="text-xl font-bold text-gray-900">{{ isset($editRestaurant) && $editRestaurant ? 'Modifier votre établissement' : 'Créer votre établissement' }}</h2>
                <p class="text-sm text-gray-500 mt-1">Renseignez vos informations. L’adresse est géocodée automatiquement (lat/lng) si possible.</p>
            </div>
            @if(isset($restaurants) && $restaurants->count() > 0)
                <div class="flex flex-wrap gap-2">
                    @foreach($restaurants as $r)
                        <a href="{{ route('restaurant.setup', ['edit' => $r->id]) }}"
                           class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border {{ (isset($editRestaurant) && $editRestaurant && $editRestaurant->id === $r->id) ? 'border-orange-300 bg-orange-50 text-orange-800' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900' }} text-sm font-semibold">
                            {{ ucfirst($r->type) }} — {{ $r->name }}
                        </a>
                    @endforeach
                    <a href="{{ route('restaurant.setup') }}"
                       class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold">
                        + Nouveau
                    </a>
                </div>
            @endif
        </div>

        <form method="POST"
              enctype="multipart/form-data"
              action="{{ isset($editRestaurant) && $editRestaurant ? route('restaurant.stores.update', $editRestaurant->id) : route('restaurant.setup.save') }}">
            @csrf
            @if(isset($editRestaurant) && $editRestaurant) @method('PUT') @endif

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Type d'établissement *</label>
                <select name="type" required data-searchable="1" data-placeholder="Rechercher un type…"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    @php($t = old('type', $editRestaurant->type ?? 'restaurant'))
                    <option value="restaurant" @selected($t==='restaurant')>Restaurant</option>
                    <option value="grocery" @selected($t==='grocery')>Épicerie</option>
                    <option value="supermarket" @selected($t==='supermarket')>Supermarché</option>
                    <option value="alcohol" @selected($t==='alcohol')>Alcool</option>
                    <option value="flowers" @selected($t==='flowers')>Fleurs</option>
                    <option value="pharmacy" @selected($t==='pharmacy')>Pharmacie</option>
                    <option value="pet" @selected($t==='pet')>Animalerie</option>
                </select>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input type="text" name="name" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                       value="{{ old('name', $editRestaurant->name ?? '') }}">
                @error('name')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea name="description" rows="3"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">{{ old('description', $editRestaurant->description ?? '') }}</textarea>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                <input type="text" name="address" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                       value="{{ old('address', $editRestaurant->address ?? '') }}">
                @error('address')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input type="text" name="phone" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                       value="{{ old('phone', $editRestaurant->phone ?? '') }}">
                @error('phone')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Site Web</label>
                <input type="url" name="website" placeholder="https://..."
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                       value="{{ old('website', $editRestaurant->website ?? '') }}">
                @error('website')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                <input type="email" name="email" placeholder="contact@restaurant.com"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                       value="{{ old('email', $editRestaurant->email ?? '') }}">
                @error('email')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Frais de livraison (FC) *</label>
                <input type="number" name="delivery_fee" min="0" required
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                       value="{{ old('delivery_fee', $editRestaurant->delivery_fee ?? '1500') }}">
                @error('delivery_fee')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Logo (URL)</label>
                <input type="text" name="logo"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                       value="{{ old('logo', $editRestaurant->logo ?? '') }}">
                @error('logo')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror

                <div class="mt-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ou uploader un logo</label>
                    <input type="file" name="logo_file" accept="image/*"
                           class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                    @error('logo_file')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                    @if(isset($editRestaurant) && $editRestaurant && $editRestaurant->logo)
                        <div class="mt-3 flex items-center gap-3">
                            <img src="{{ $editRestaurant->logo }}" alt="" class="h-12 w-12 rounded-lg object-contain border border-gray-200" />
                            <p class="text-xs text-gray-500">Aperçu actuel</p>
                        </div>
                    @endif
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Image de couverture (URL)</label>
                <input type="text" name="image"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                       value="{{ old('image', $editRestaurant->image ?? '') }}">
                @error('image')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror

                <div class="mt-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ou uploader une image</label>
                    <input type="file" name="image_file" accept="image/*"
                           class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                    @error('image_file')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                    @if(isset($editRestaurant) && $editRestaurant && $editRestaurant->image)
                        <div class="mt-3 flex items-center gap-3">
                            <img src="{{ $editRestaurant->image }}" alt="" class="h-12 w-12 rounded-lg object-cover border border-gray-200" />
                            <p class="text-xs text-gray-500">Aperçu actuel</p>
                        </div>
                    @endif
                </div>
            </div>

            @if(isset($editRestaurant) && $editRestaurant)
                <div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
                    <div>
                        <p class="text-sm font-semibold text-gray-900">Statut</p>
                        <p class="text-xs text-gray-500">Fermé = caché côté client.</p>
                    </div>
                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" name="is_open" value="1" class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                               @checked(old('is_open', $editRestaurant->is_open) ? true : false) />
                        <span class="text-sm font-medium text-gray-700">Ouvert</span>
                    </label>
                </div>
            @endif

            <button type="submit"
                    class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
                {{ isset($editRestaurant) && $editRestaurant ? 'Enregistrer' : 'Créer l\'établissement' }}
            </button>
        </form>
    </div>
</div>
@endsection
