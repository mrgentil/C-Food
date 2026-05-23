@extends('layouts.restaurant')

@section('page-title', 'Menu')

@section('page-content')
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Articles du menu</h3>
            <a href="{{ route('restaurant.menu.create') }}"
               class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                + Ajouter un article
            </a>
        </div>
        <div class="overflow-x-auto">
            <table class="admin-table admin-table-wide min-w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse ($menuItems as $item)
                        <tr>
                            <td class="px-6 py-4">
                                <div class="flex items-center">
                                    @if($item->image)
                                        <img class="h-10 w-10 rounded-lg mr-3 object-cover shadow-sm" src="{{ $item->image }}" alt="">
                                    @endif
                                    <div>
                                        <div class="text-sm font-semibold text-gray-900">{{ $item->name }}</div>
                                        <div class="flex flex-wrap gap-1 mt-1">
                                            @if($item->is_popular)
                                                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                    🔥 Populaire
                                                </span>
                                            @endif
                                            @if($item->is_veg)
                                                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    🌱 Veg
                                                </span>
                                            @endif
                                            @if($item->is_spicy)
                                                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                                    🌶️ Épicé
                                                </span>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ $item->description }}</td>
                            <td class="px-6 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">{{ number_format($item->price, 0, ',', ' ') }} FC</td>
                            <td class="px-6 py-4 text-sm text-gray-500">{{ $item->category }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                @if($item->is_available)
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Disponible
                                    </span>
                                @else
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        Indisponible
                                    </span>
                                @endif
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a href="{{ route('restaurant.menu.edit', $item->id) }}"
                                   class="text-orange-600 hover:text-orange-900 mr-3">Modifier</a>
                                <form action="{{ route('restaurant.menu.delete', $item->id) }}"
                                      method="POST" class="inline"
                                      onsubmit="return confirm('Supprimer cet article ?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600 hover:text-red-900">Supprimer</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                                <p class="mb-4">Aucun article pour le moment.</p>
                                <a href="{{ route('restaurant.menu.create') }}" class="inline-flex bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                                    + Créer le premier article
                                </a>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
@endsection
