@extends('layouts.app')

@section('content')
<div class="mb-6 flex justify-between items-center">
    <div>
        <h1 class="text-2xl font-bold text-gray-900">Paramètres de l'Application</h1>
        <p class="text-sm text-gray-500">Gérez le logo et les couleurs de toutes vos applications (Client, Livreur, Web).</p>
    </div>
</div>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
    <form action="{{ route('admin.settings.update') }}" method="POST" enctype="multipart/form-data">
        @csrf
        
        <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Identité Visuelle</h3>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Couleur Principale (Code Hex)</label>
                <div class="flex items-center space-x-3">
                    <input type="color" name="primary_color" value="{{ $settings['primary_color'] ?? '#0EA5E9' }}" class="h-10 w-10 border-0 rounded cursor-pointer">
                    <input type="text" name="primary_color_text" value="{{ $settings['primary_color'] ?? '#0EA5E9' }}" class="w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" disabled>
                    <p class="text-xs text-gray-500 ml-2">(Exemple: #0EA5E9 pour le bleu C-Food)</p>
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Logo de l'application</label>
                
                @if(!empty($settings['app_logo']))
                <div class="mb-3 p-4 bg-gray-50 rounded-lg inline-block border border-gray-200">
                    <img src="{{ url($settings['app_logo']) }}" alt="Logo actuel" class="h-16 object-contain">
                </div>
                @endif
                
                <input type="file" name="logo_file" accept="image/*" class="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                ">
                <p class="text-xs text-gray-500 mt-2">Ce logo sera automatiquement mis à jour sur l'application client et livreur. (Format suggéré: PNG transparent, max 2MB).</p>
            </div>
        </div>

        <div class="flex justify-end">
            <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
                Enregistrer les paramètres
            </button>
        </div>
    </form>
</div>

<script>
    document.querySelector('input[name="primary_color"]').addEventListener('input', function(e) {
        document.querySelector('input[name="primary_color_text"]').value = e.target.value;
    });
</script>
@endsection
