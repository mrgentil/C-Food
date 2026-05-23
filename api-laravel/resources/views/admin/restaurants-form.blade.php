@extends('layouts.app')

@section('header')
    <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Modifier établissement</h1>
            <p class="text-sm text-gray-500 mt-1">Infos visibles dans l’app + affectation au compte marchand.</p>
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
    @if (session('success'))
        <div class="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>{{ session('success') }}</div>
        </div>
    @endif

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-6xl">
        <form method="POST" action="{{ route('admin.restaurants.update', $restaurant) }}" enctype="multipart/form-data">
            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-6">
                <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                    <h2 class="text-sm font-semibold text-gray-900">Infos établissement</h2>
                    <p class="text-xs text-gray-500 mt-1">Nom, type et visibilité dans l’app.</p>

                    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <div class="relative">
                        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                            </svg>
                        </span>
                        <input name="name" value="{{ old('name', $restaurant->name) }}"
                               class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                               required />
                    </div>
                    @error('name') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select name="type" data-searchable="1" data-placeholder="Rechercher un type…" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        @foreach(($storeTypes ?? []) as $key => $label)
                            <option value="{{ $key }}" @selected(old('type', $restaurant->type ?? 'restaurant') === $key)>{{ $label }}</option>
                        @endforeach
                    </select>
                    @error('type') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Site Web</label>
                    <input name="website" type="url" value="{{ old('website', $restaurant->website) }}"
                           placeholder="https://..."
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    @error('website') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                    <input name="email" type="email" value="{{ old('email', $restaurant->email) }}"
                           placeholder="contact@restaurant.com"
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    @error('email') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Propriétaire (compte marchand)</label>
                            <select name="owner_user_id" data-searchable="1" data-placeholder="Rechercher un marchand…" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                <option value="">— Aucun —</option>
                                @foreach(($owners ?? []) as $u)
                                    <option value="{{ $u->id }}" @selected((string) old('owner_user_id', $restaurant->owner_user_id) === (string) $u->id)>
                                        {{ $u->name }} ({{ $u->email }})
                                    </option>
                                @endforeach
                            </select>
                            @error('owner_user_id') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            <p class="text-xs text-gray-500 mt-1">
                                Associe l’établissement au compte qui gérera le menu et les commandes.
                            </p>
                        </div>

                        <div class="md:col-span-2">
                            <div class="rounded-lg border border-gray-200 bg-white p-3 flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-semibold text-gray-900">Statut</p>
                                    <p class="text-xs text-gray-500">Désactiver = n’apparaît plus côté client.</p>
                                </div>
                                <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                                    <input id="is_open" type="checkbox" name="is_open" value="1" class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" @checked(old('is_open', $restaurant->is_open) ? true : false) />
                                    <span class="text-sm font-medium text-gray-700">Ouvert</span>
                                </label>
                            </div>
                            @error('is_open') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                        </div>

                        <div class="md:col-span-2">
                            <div class="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
                                <p class="text-sm font-semibold text-gray-900">Visibilité dans l’app</p>
                                <p class="text-xs text-gray-500">Accueil client : section « En vedette », badges, etc.</p>
                                <div class="flex flex-col sm:flex-row sm:flex-wrap gap-4 pt-1">
                                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox" name="is_featured" value="1"
                                               class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                               @checked(old('is_featured', $restaurant->is_featured)) />
                                        <span class="text-sm font-medium text-gray-700">En vedette</span>
                                    </label>
                                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox" name="is_new" value="1"
                                               class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                               @checked(old('is_new', $restaurant->is_new)) />
                                        <span class="text-sm font-medium text-gray-700">Nouveau</span>
                                    </label>
                                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox" name="is_promoted" value="1"
                                               class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                               @checked(old('is_promoted', $restaurant->is_promoted)) />
                                        <span class="text-sm font-medium text-gray-700">Mis en avant</span>
                                    </label>
                                </div>
                            </div>
                            @error('is_featured') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            @error('is_new') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            @error('is_promoted') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                        </div>
                    </div>
                </div>

                <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                    <h2 class="text-sm font-semibold text-gray-900">Livraison & seuils</h2>
                    <p class="text-xs text-gray-500 mt-1">Paramètres visibles au checkout.</p>

                    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Temps livraison</label>
                    <div class="relative">
                        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22a10 10 0 110-20 10 10 0 010 20z"></path>
                            </svg>
                        </span>
                        <input name="delivery_time" value="{{ old('delivery_time', $restaurant->delivery_time) }}"
                               class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    @error('delivery_time') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Frais livraison (FC)</label>
                    <input name="delivery_fee" type="number" min="0" value="{{ old('delivery_fee', $restaurant->delivery_fee) }}"
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    @error('delivery_fee') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Minimum commande (FC)</label>
                    <input name="min_order" type="number" min="0" value="{{ old('min_order', $restaurant->min_order) }}"
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    @error('min_order') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                        </div>
                    </div>
                </div>

                <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                    <h2 class="text-sm font-semibold text-gray-900">Localisation</h2>
                    <p class="text-xs text-gray-500 mt-1">Pour la carte et “ouvrir dans Maps”.</p>

                    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input name="latitude" value="{{ old('latitude', $restaurant->latitude) }}"
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    @error('latitude') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input name="longitude" value="{{ old('longitude', $restaurant->longitude) }}"
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    @error('longitude') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                        </div>
                    </div>
                </div>
                </div>

                <div class="space-y-6">
                <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                    <h2 class="text-sm font-semibold text-gray-900">Branding</h2>
                    <p class="text-xs text-gray-500 mt-1">Image utilisée dans les listes.</p>

                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Logo (URL)</label>
                        <div class="relative">
                            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h18v14H3V5zm4 10l2-2 3 3 5-5 2 2"></path>
                                </svg>
                            </span>
                            <input name="logo" value="{{ old('logo', $restaurant->logo) }}"
                                   class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                        @error('logo') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                        <div class="mt-3">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ou uploader un logo</label>
                            <input type="file" name="logo_file" accept="image/*"
                                   class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                            @error('logo_file') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            @if($restaurant->logo)
                                <div class="mt-3 flex items-center gap-3">
                                    <img src="{{ $restaurant->logo }}" alt="" class="h-12 w-12 rounded-lg object-contain border border-gray-200" />
                                    <p class="text-xs text-gray-500">Aperçu logo</p>
                                </div>
                            @endif
                        </div>
                    </div>

                    <hr class="my-6 border-gray-200">

                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Image de couverture (URL)</label>
                    <div class="relative">
                        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h18v14H3V5zm4 10l2-2 3 3 5-5 2 2"></path>
                            </svg>
                        </span>
                        <input name="image" value="{{ old('image', $restaurant->image) }}"
                               class="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    @error('image') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                        <div class="mt-3">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ou uploader une image</label>
                            <input type="file" name="image_file" accept="image/*"
                                   class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                            @error('image_file') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                            @if($restaurant->image)
                                <div class="mt-3 flex items-center gap-3">
                                    <img src="{{ $restaurant->image }}" alt="" class="h-12 w-12 rounded-lg object-cover border border-gray-200" />
                                    <p class="text-xs text-gray-500">Aperçu actuel</p>
                                </div>
                            @endif
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
                    Enregistrer
                </button>
                <a href="{{ route('admin.restaurants') }}" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-900 shadow-sm">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Annuler
                </a>
            </div>
        </form>

        <div class="mt-8 rounded-xl border border-red-200 bg-red-50/40 p-6">
            <h2 class="text-sm font-semibold text-red-900">Zone danger</h2>
            <p class="text-xs text-red-800/90 mt-1">Supprimer cet établissement efface aussi les commandes, le menu et les données associées ({{ $restaurant->orders_count }} commande(s), {{ $restaurant->menu_items_count }} article(s)).</p>
            @php($deleteConfirmForm = 'Supprimer définitivement « '.$restaurant->name.' » ?'."\n\n".'Cela supprimera aussi '.$restaurant->orders_count.' commande(s) et '.$restaurant->menu_items_count.' article(s) de menu. Action irréversible.')
            <form method="POST" action="{{ route('admin.restaurants.destroy', $restaurant) }}" class="mt-4 inline"
                  onsubmit="return confirm(@json($deleteConfirmForm))">
                @csrf
                @method('DELETE')
                <button type="submit" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white text-red-800 text-sm font-semibold hover:bg-red-50 shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Supprimer cet établissement
                </button>
            </form>
        </div>
    </div>
@endsection

