@extends('layouts.restaurant')

@section('page-title', 'Promos')

@section('page-content')
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b flex items-center justify-between">
            <div>
                <h3 class="text-lg font-semibold text-gray-900">Codes promo (établissement)</h3>
                <p class="text-sm text-gray-500">Ces promos s’appliquent uniquement à ton établissement sélectionné.</p>
            </div>
            <a href="{{ route('restaurant.promos.create') }}"
               class="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 shadow-sm">
                + Nouveau code
            </a>
        </div>

        <div class="px-6 py-4 border-b">
            <form method="GET" class="flex flex-col md:flex-row md:items-center gap-2">
                <select name="restaurant_id" data-searchable="1" data-placeholder="Établissement…" class="w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    @foreach($restaurants as $r)
                        <option value="{{ $r->id }}" @selected($selectedRestaurantId == $r->id)>{{ $r->name }} ({{ $r->type }})</option>
                    @endforeach
                </select>
                <input name="q" value="{{ request('q') }}" placeholder="Code…" class="w-full md:w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <select name="type" class="w-full md:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Tous types</option>
                    <option value="percent" @selected(request('type')==='percent')>%</option>
                    <option value="fixed" @selected(request('type')==='fixed')>Fixe</option>
                </select>
                <select name="active" class="w-full md:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Actif/off</option>
                    <option value="1" @selected(request('active')==='1')>Actif</option>
                    <option value="0" @selected(request('active')==='0')>Off</option>
                </select>
                <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold" type="submit">Filtrer</button>
                <a href="{{ route('restaurant.promos') }}" class="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Reset</a>
            </form>
        </div>

        <div class="overflow-x-auto">
            <table class="admin-table admin-table-wide min-w-full">
                <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actif</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                @forelse($promos as $p)
                    <tr class="hover:bg-gray-50/50">
                        <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ $p->code }}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">{{ $p->type }}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">
                            @if($p->type === 'percent')
                                {{ $p->value }}%
                            @else
                                {{ number_format($p->value) }} FC
                            @endif
                        </td>
                        <td class="px-6 py-4 text-sm">
                            @if($p->is_active)
                                <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-100">
                                    Actif
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                                    Off
                                </span>
                            @endif
                        </td>
                        <td class="px-6 py-4 text-right text-sm">
                            <a href="{{ route('restaurant.promos.edit', $p) }}" class="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 text-sm font-medium shadow-sm">
                                Éditer
                            </a>
                            <form method="POST" action="{{ route('restaurant.promos.destroy', $p) }}" class="inline" onsubmit="return confirm('Supprimer ce code ?')">
                                @csrf
                                @method('DELETE')
                                <button class="ml-2 inline-flex items-center px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold shadow-sm" type="submit">
                                    Supprimer
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td class="px-6 py-12 text-center text-gray-500" colspan="5">Aucune promo.</td>
                    </tr>
                @endforelse
                </tbody>
            </table>
        </div>

        <div class="px-6 py-4">
            {{ $promos->links() }}
        </div>
    </div>
@endsection

