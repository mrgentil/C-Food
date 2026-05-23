@extends('layouts.restaurant')

@section('page-title', 'Gestion des commandes')

@section('page-content')
    <!-- Status Filter -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div class="flex flex-wrap gap-2">
            <button type="button" onclick="filterOrders(this, 'all')" class="status-filter px-4 py-2 rounded-lg text-sm font-medium bg-orange-50 text-orange-700">
                Toutes
            </button>
            <button type="button" onclick="filterOrders(this, 'pending')" class="status-filter px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                En attente
            </button>
            <button type="button" onclick="filterOrders(this, 'preparing')" class="status-filter px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                En préparation
            </button>
            <button type="button" onclick="filterOrders(this, 'picked_up')" class="status-filter px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Récupérée
            </button>
            <button type="button" onclick="filterOrders(this, 'delivering')" class="status-filter px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                En livraison
            </button>
            <button type="button" onclick="filterOrders(this, 'delivered')" class="status-filter px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Livrée
            </button>
            <button type="button" onclick="filterOrders(this, 'cancelled')" class="status-filter px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Annulée
            </button>
        </div>
    </div>

    <!-- Orders Table -->
    <div class="admin-card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="admin-table admin-table-wide min-w-full">
                <thead>
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livreur</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200" id="orders-table">
                    @foreach ($orders as $order)
                        <tr class="order-row hover:bg-gray-50" data-status="{{ $order->status }}">
                            <td class="px-6 py-4 text-sm font-medium text-gray-900">#{{ $order->id }}</td>
                            <td class="px-6 py-4">
                                <div class="text-sm font-medium text-gray-900">{{ $order->user->name ?? 'Client' }}</div>
                                <div class="text-xs text-gray-500">{{ $order->user->phone ?? '' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-500">
                                    @foreach($order->items->take(2) as $item)
                                        <div>{{ $item->quantity }}x {{ $item->menuItem->name ?? 'Article' }}</div>
                                    @endforeach
                                    @if($order->items->count() > 2)
                                        <div class="text-xs text-gray-400">+{{ $order->items->count() - 2 }} autres</div>
                                    @endif
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ number_format((int) $order->total, 0, '.', ' ') }} FC</td>
                            <td class="px-6 py-4">
                                @if($order->driver)
                                    <div class="text-sm font-medium text-gray-900">{{ $order->driver->name }}</div>
                                    <div class="text-xs text-gray-500">{{ $order->driver->phone ?? '' }}</div>
                                @else
                                    <div class="text-xs text-gray-400">Non assigné</div>
                                @endif
                            </td>
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
                                        'preparing' => 'Préparation',
                                        'picked_up' => 'Récupérée',
                                        'delivering' => 'En route',
                                        'delivered' => 'Livrée',
                                        'cancelled' => 'Annulée',
                                    ];
                                @endphp
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {{ $statusColors[$order->status] ?? 'bg-gray-100' }}">
                                    {{ $statusLabels[$order->status] ?? $order->status }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                @include('restaurant.partials.order-action-buttons', ['order' => $order])
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-6 py-4 border-t">
            {{ $orders->links() }}
        </div>
    </div>
@endsection

@section('page-scripts')
    <script>
        function filterOrders(btn, status) {
            document.querySelectorAll('.status-filter').forEach(b => {
                b.classList.remove('bg-orange-50', 'text-orange-700');
                b.classList.add('text-gray-600');
            });
            btn.classList.add('bg-orange-50', 'text-orange-700');
            btn.classList.remove('text-gray-600');

            document.querySelectorAll('.order-row').forEach(row => {
                if (status === 'all' || row.dataset.status === status) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    </script>
@endsection
