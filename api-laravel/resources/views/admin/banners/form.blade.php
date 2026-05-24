@extends('layouts.app')

@section('header')
    <div class="flex items-center gap-4">
        <a href="{{ route('admin.banners') }}" class="p-2 rounded-lg text-dark-muted hover:bg-dark-bg hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </a>
        <x-admin.page-header
            :title="$banner ? 'Modifier la publicité : ' . $banner->title : 'Nouvelle publicité'"
            :subtitle="$banner ? 'Modifiez les informations de cette bannière.' : 'Ajoutez une nouvelle bannière publicitaire.'">
        </x-admin.page-header>
    </div>
@endsection

@section('content')
    <form action="{{ $banner ? route('admin.banners.update', $banner) : route('admin.banners.store') }}" method="POST" enctype="multipart/form-data" class="max-w-3xl space-y-6">
        @csrf
        @if($banner) @method('PUT') @endif

        <x-admin.card padding>
            <div class="space-y-6">
                <!-- Title -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="title">Titre de la publicité</label>
                    <input type="text" name="title" id="title" required
                           value="{{ old('title', $banner->title ?? '') }}"
                           class="admin-input" placeholder="Ex: Livraison GRATUITE">
                    @error('title') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Subtitle -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="subtitle">Sous-titre</label>
                    <input type="text" name="subtitle" id="subtitle"
                           value="{{ old('subtitle', $banner->subtitle ?? '') }}"
                           class="admin-input" placeholder="Ex: Sur votre 1ère commande avec le code BIENVENUE">
                    @error('subtitle') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Image Upload -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="image_file">Image de la bannière (Fichier)</label>
                    @if($banner && $banner->image)
                        <div class="mb-3">
                            <p class="text-xs text-dark-muted mb-1">Image actuelle :</p>
                            <img src="{{ $banner->image }}" alt="{{ $banner->title }}" class="h-24 w-auto object-cover rounded-lg">
                        </div>
                    @endif
                    <input type="file" name="image_file" id="image_file" accept="image/*" class="admin-input">
                    <p class="text-xs text-dark-muted mt-1">Laissez vide pour conserver l'image actuelle. Format recommandé: 800×400px. Taille max: 4Mo.</p>
                    @error('image_file') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Image URL Fallback -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="image">Ou URL de l'image</label>
                    <input type="url" name="image" id="image"
                           value="{{ old('image', $banner->image ?? '') }}"
                           class="admin-input" placeholder="https://example.com/banner.jpg">
                    @error('image') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Color Picker -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="color">Couleur de fond</label>
                    <div class="flex items-center gap-3">
                        <input type="color" name="color" id="color"
                               value="{{ old('color', $banner->color ?? '#0EA5E9') }}"
                               class="w-12 h-10 rounded-lg cursor-pointer border border-dark-border bg-transparent">
                        <input type="text" id="color_hex" readonly
                               value="{{ old('color', $banner->color ?? '#0EA5E9') }}"
                               class="admin-input w-32 font-mono text-sm">
                    </div>
                    <p class="text-xs text-dark-muted mt-1">Cette couleur est utilisée comme fond de la bannière dans l'app.</p>
                    @error('color') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <hr class="border-dark-border">

                <!-- Action Type -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="action_type">Action au clic (optionnel)</label>
                    <select name="action_type" id="action_type" class="admin-select">
                        <option value="none" @selected(old('action_type', $banner->action_type ?? 'none') === 'none')>Aucune action (affichage seul)</option>
                        <option value="restaurant" @selected(old('action_type', $banner->action_type ?? '') === 'restaurant')>Ouvrir un restaurant</option>
                        <option value="category" @selected(old('action_type', $banner->action_type ?? '') === 'category')>Ouvrir une catégorie</option>
                        <option value="url" @selected(old('action_type', $banner->action_type ?? '') === 'url')>Ouvrir un lien externe</option>
                    </select>
                    @error('action_type') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Action Value -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="action_value">Valeur de l'action</label>
                    <input type="text" name="action_value" id="action_value"
                           value="{{ old('action_value', $banner->action_value ?? '') }}"
                           class="admin-input" placeholder="ID du restaurant, nom de catégorie, ou URL…">
                    <p class="text-xs text-dark-muted mt-1">Remplissez selon le type d'action choisi. Laissez vide si "Aucune action".</p>
                    @error('action_value') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <hr class="border-dark-border">

                <!-- Order Index -->
                <div>
                    <label class="block text-sm font-medium text-white mb-2" for="order_index">Ordre d'affichage</label>
                    <input type="number" name="order_index" id="order_index"
                           value="{{ old('order_index', $banner->order_index ?? '0') }}"
                           class="admin-input" placeholder="0">
                    <p class="text-xs text-dark-muted mt-1">Un chiffre plus bas = affiché en premier.</p>
                    @error('order_index') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <!-- Active Status -->
                <div>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="is_active" value="1"
                               class="admin-checkbox"
                               @checked(old('is_active', $banner->is_active ?? true))>
                        <span class="text-sm font-medium text-white">Publicité active</span>
                    </label>
                    <p class="text-xs text-dark-muted mt-1 ml-7">Décochez pour masquer cette bannière dans l'application.</p>
                    @error('is_active') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
            </div>
        </x-admin.card>

        <!-- Preview -->
        <x-admin.card padding>
            <p class="text-sm font-medium text-white mb-3">Aperçu de la bannière</p>
            <div id="banner-preview" class="relative rounded-xl overflow-hidden h-36" style="background-color: {{ old('color', $banner->color ?? '#0EA5E9') }}">
                <img id="preview-img" src="{{ old('image', $banner->image ?? 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800') }}" alt="Aperçu" class="absolute inset-0 w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/45"></div>
                <div class="absolute bottom-0 left-0 p-4">
                    <p id="preview-title" class="text-white text-xl font-bold">{{ old('title', $banner->title ?? 'Titre de la publicité') }}</p>
                    <p id="preview-subtitle" class="text-white/85 text-sm mt-1">{{ old('subtitle', $banner->subtitle ?? 'Sous-titre de la publicité') }}</p>
                </div>
            </div>
        </x-admin.card>

        <div class="flex gap-4 pt-4">
            <x-admin.button type="submit" variant="primary">
                {{ $banner ? 'Enregistrer les modifications' : 'Créer la publicité' }}
            </x-admin.button>
            <x-admin.button :href="route('admin.banners')" variant="secondary">Annuler</x-admin.button>
        </div>
    </form>

    <script>
        // Live color sync
        document.getElementById('color')?.addEventListener('input', function(e) {
            document.getElementById('color_hex').value = e.target.value;
            document.getElementById('banner-preview').style.backgroundColor = e.target.value;
        });
        // Live title sync
        document.getElementById('title')?.addEventListener('input', function(e) {
            document.getElementById('preview-title').textContent = e.target.value || 'Titre de la publicité';
        });
        // Live subtitle sync
        document.getElementById('subtitle')?.addEventListener('input', function(e) {
            document.getElementById('preview-subtitle').textContent = e.target.value || 'Sous-titre de la publicité';
        });
        // Live image preview
        document.getElementById('image_file')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) { document.getElementById('preview-img').src = ev.target.result; };
                reader.readAsDataURL(file);
            }
        });
        document.getElementById('image')?.addEventListener('input', function(e) {
            if (e.target.value) { document.getElementById('preview-img').src = e.target.value; }
        });
    </script>
@endsection
