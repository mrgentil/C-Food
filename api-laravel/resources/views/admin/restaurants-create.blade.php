@extends('layouts.app')

@section('header')
    <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Ajouter établissement</h1>
            <p class="text-sm text-gray-500 mt-1">Créer un établissement et (optionnel) l’affecter à un marchand.</p>
        </div>
        <a href="{{ route('admin.restaurants') }}"
           class="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Retour
        </a>
    </div>
@endsection

@section('content')
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-6xl">
        <form method="POST" action="{{ route('admin.restaurants.store') }}" enctype="multipart/form-data">
            @csrf

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-6">
                    <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                        <h2 class="text-sm font-semibold text-gray-900">Infos établissement</h2>
                        <p class="text-xs text-gray-500 mt-1">Nom, type et propriétaire.</p>

                        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input name="name" value="{{ old('name') }}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                       required />
                                @error('name') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select name="type" data-searchable="1" data-placeholder="Rechercher un type…"
                                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                    @php($t = old('type', 'restaurant'))
                                    @foreach(($storeTypes ?? []) as $key => $label)
                                        <option value="{{ $key }}" @selected($t === $key)>{{ $label }}</option>
                                    @endforeach
                                </select>
                                @error('type') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Site Web</label>
                                <input name="website" type="url" value="{{ old('website') }}"
                                       placeholder="https://..."
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                @error('website') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                                <input name="email" type="email" value="{{ old('email') }}"
                                       placeholder="contact@restaurant.com"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                @error('email') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Propriétaire (marchand)</label>
                                <select name="owner_user_id" data-searchable="1" data-placeholder="Rechercher un marchand…"
                                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                    <option value="">— Aucun —</option>
                                    @foreach(($owners ?? []) as $u)
                                        <option value="{{ $u->id }}" @selected((string) old('owner_user_id') === (string) $u->id)>
                                            {{ $u->name }} ({{ $u->email }})
                                        </option>
                                    @endforeach
                                </select>
                                @error('owner_user_id') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            </div>

                            <div class="md:col-span-2">
                                <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="is_open" value="1"
                                           class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                           @checked(old('is_open', true)) />
                                    <span class="text-sm font-medium text-gray-700">Ouvert</span>
                                </label>
                            </div>

                            <div class="md:col-span-2">
                                <div class="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
                                    <p class="text-sm font-semibold text-gray-900">Visibilité dans l’app</p>
                                    <p class="text-xs text-gray-500">Accueil client : « En vedette », badges nouveauté / promotion.</p>
                                    <div class="flex flex-col sm:flex-row sm:flex-wrap gap-4 pt-1">
                                        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" name="is_featured" value="1"
                                                   class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                   @checked(old('is_featured', false)) />
                                            <span class="text-sm font-medium text-gray-700">En vedette</span>
                                        </label>
                                        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" name="is_new" value="1"
                                                   class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                   @checked(old('is_new', false)) />
                                            <span class="text-sm font-medium text-gray-700">Nouveau</span>
                                        </label>
                                        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" name="is_promoted" value="1"
                                                   class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                   @checked(old('is_promoted', false)) />
                                            <span class="text-sm font-medium text-gray-700">Mis en avant</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                        <h2 class="text-sm font-semibold text-gray-900">Livraison & seuils</h2>
                        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Temps livraison</label>
                                <input name="delivery_time" value="{{ old('delivery_time', '30-40 min') }}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Frais livraison (FC)</label>
                                <input name="delivery_fee" type="number" min="0" value="{{ old('delivery_fee', 1500) }}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Minimum commande (FC)</label>
                                <input name="min_order" type="number" min="0" value="{{ old('min_order', 0) }}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                        <h2 class="text-sm font-semibold text-gray-900">Contact & adresse</h2>
                        <div class="mt-4 grid grid-cols-1 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input name="phone" value="{{ old('phone') }}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <input name="address" value="{{ old('address') }}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" rows="3"
                                          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">{{ old('description') }}</textarea>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                        <h2 class="text-sm font-semibold text-gray-900">Localisation</h2>
                        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input name="latitude" value="{{ old('latitude') }}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input name="longitude" value="{{ old('longitude') }}"
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                        <h2 class="text-sm font-semibold text-gray-900">Branding</h2>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Logo (URL)</label>
                            <input name="logo" value="{{ old('logo') }}"
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            <div class="mt-3">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ou uploader un logo</label>
                                <input type="file" name="logo_file" accept="image/*"
                                       class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                            </div>
                        </div>
                        <hr class="my-6 border-gray-200">
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Image de couverture (URL)</label>
                            <input name="image" value="{{ old('image') }}"
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            <div class="mt-3">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ou uploader une image</label>
                                <input type="file" name="image_file" accept="image/*"
                                       class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3 mt-6">
                <button class="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm" type="submit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Créer
                </button>
                <a href="{{ route('admin.restaurants') }}" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-900 shadow-sm">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection

