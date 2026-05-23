@extends('layouts.restaurant')

@section('page-title', 'Dashboard - ' . ($restaurant->name ?? 'Restaurant'))

@section('page-content')
    <!-- Restaurant Selector -->
    @if(isset($restaurants) && $restaurants->count() > 1)
        <div class="mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <form method="POST" action="{{ route('restaurant.switch') }}">
                @csrf
                <div class="flex items-center space-x-4">
                    <label class="text-sm font-medium text-gray-700">Etablissement actuel:</label>
                    <select name="restaurant_id" onchange="this.form.submit()"
                            class="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                        @foreach($restaurants as $r)
                            <option value="{{ $r->id }}" {{ $r->id == $restaurant->id ? 'selected' : '' }}>
                                {{ ucfirst($r->type) }} - {{ $r->name }}
                            </option>
                        @endforeach
                    </select>
                    <a href="{{ route('restaurant.setup') }}"
                       class="text-sm text-orange-600 hover:text-orange-800 font-medium">
                        + Ajouter
                    </a>
                </div>
            </form>
        </div>
    @endif

    <!-- Accès rapides (menu & commandes) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <a href="{{ route('restaurant.orders') }}"
           class="block bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-orange-300 hover:shadow-md transition">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900">Commandes</h3>
            </div>
            <p class="text-sm text-gray-500">Voir les commandes, accepter ou refuser, mettre à jour le statut (préparation, livraison…).</p>
        </a>
        <a href="{{ route('restaurant.menu') }}"
           class="block bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-orange-300 hover:shadow-md transition">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900">Menu</h3>
            </div>
            <p class="text-sm text-gray-500">Liste des articles, prix et catégories. Utilisez « Ajouter un article » pour créer un plat.</p>
        </a>
        <a href="{{ route('restaurant.menu.create') }}"
           class="block bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-bold">Nouvel article</h3>
            </div>
            <p class="text-sm text-orange-100">Ajouter un plat, une boisson ou une catégorie au menu de {{ $restaurant->name ?? 'votre établissement' }}.</p>
        </a>
        <a href="{{ route('restaurant.promos') }}"
           class="block bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-orange-300 hover:shadow-md transition">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-7 3a1 1 0 11-2 0 1 1 0 012 0zm10 10a1 1 0 11-2 0 1 1 0 012 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M3 7a4 4 0 004 4h0a4 4 0 014 4v0a4 4 0 004 4h1a2 2 0 002-2v-1a4 4 0 00-4-4v0a4 4 0 01-4-4v0a4 4 0 00-4-4H5a2 2 0 00-2 2v1z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900">Promos</h3>
            </div>
            <p class="text-sm text-gray-500">Codes promo pour votre établissement : créer, modifier ou désactiver.</p>
        </a>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                </div>
            </div>
            <h3 class="text-3xl font-bold text-gray-900">{{ $stats['orders_count'] }}</h3>
            <p class="text-sm text-gray-500 mt-1">Commandes totales</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
            <h3 class="text-3xl font-bold text-gray-900">{{ $stats['pending_orders'] }}</h3>
            <p class="text-sm text-gray-500 mt-1">En attente</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                </div>
            </div>
            <h3 class="text-3xl font-bold text-gray-900">{{ $stats['menu_items_count'] }}</h3>
            <p class="text-sm text-gray-500 mt-1">Articles au menu</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
            <h3 class="text-3xl font-bold text-gray-900">{{ number_format((float) $stats['revenue'], 0, '.', ' ') }} FC</h3>
            <p class="text-sm text-gray-500 mt-1">Revenu total</p>
        </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Dernières commandes</h3>
            <a href="{{ route('restaurant.orders') }}" class="text-sm text-orange-600 hover:text-orange-800 font-medium">
                Voir tout →
            </a>
        </div>
        <div class="overflow-x-auto">
            @if($recentOrders->count() > 0)
                <table class="admin-table admin-table-wide min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @foreach($recentOrders as $order)
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 text-sm font-medium text-gray-900">#{{ $order->id }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ $order->user->name ?? 'N/A' }}</td>
                                <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ number_format((int) $order->total, 0, '.', ' ') }} FC</td>
                                <td class="px-6 py-4">
                                    @php
                                        $statusColors = [
                                            'pending' => 'bg-yellow-100 text-yellow-800',
                                            'preparing' => 'bg-blue-100 text-blue-800',
                                            'picked_up' => 'bg-indigo-100 text-indigo-800',
                                            'delivering' => 'bg-purple-100 text-purple-800',
                                            'delivered' => 'bg-green-100 text-green-800',
                                            'cancelled' => 'bg-red-100 text-red-800',
                                        ];
                                        $statusLabels = [
                                            'pending' => 'En attente',
                                            'preparing' => 'En préparation',
                                            'picked_up' => 'Récupérée',
                                            'delivering' => 'En livraison',
                                            'delivered' => 'Livrée',
                                            'cancelled' => 'Annulée',
                                        ];
                                    @endphp
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {{ $statusColors[$order->status] ?? 'bg-gray-100' }}">
                                        {{ $statusLabels[$order->status] ?? $order->status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-500">
                                    {{ $order->created_at->format('d/m H:i') }}
                                </td>
                                <td class="px-6 py-4 align-top">
                                    @include('restaurant.partials.order-action-buttons', ['order' => $order])
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="px-6 py-12 text-center">
                    <p class="text-gray-500">Aucune commande pour le moment</p>
                </div>
            @endif
        </div>
    </div>
@endsection
