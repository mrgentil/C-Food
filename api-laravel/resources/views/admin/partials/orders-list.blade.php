@php($statusLabels = ['pending' => 'En attente', 'preparing' => 'Préparation', 'picked_up' => 'Récupérée', 'delivering' => 'En route', 'delivered' => 'Livrée', 'cancelled' => 'Annulée'])
@php($statusVariant = ['pending' => 'yellow', 'preparing' => 'blue', 'picked_up' => 'blue', 'delivering' => 'brand', 'delivered' => 'green', 'cancelled' => 'red'])
<div id="orders-list" class="admin-live-region border-t border-gray-200" data-live-url="{{ route('admin.orders') }}">
    <div class="admin-live-overlay" aria-hidden="true"><div class="admin-live-spinner" role="status"></div></div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table admin-table-wide min-w-full">
            <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="col-id text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Restaurant</th>
                    <th class="col-num py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Livreur</th>
                    <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="col-actions py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @forelse ($orders as $order)
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="col-id px-6 py-4 text-sm font-bold text-gray-900">#{{ $order->id }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ $order->user->name ?? '—' }}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">{{ $order->restaurant->name ?? '—' }}</td>
                        <td class="col-num px-6 py-4 text-sm font-semibold text-gray-900">{{ number_format($order->total) }} FC</td>
                        <td class="px-6 py-4 text-sm">
                            @if($order->driver)
                                <div class="font-medium text-gray-900">{{ $order->driver->name }}</div>
                                <div class="text-xs text-gray-500">{{ $order->driver->phone ?? '' }}</div>
                            @else
                                <span class="text-xs text-gray-400 italic">Non assigné</span>
                            @endif
                        </td>
                        <td class="px-6 py-4"><x-admin.badge :variant="$statusVariant[$order->status] ?? 'gray'">{{ $statusLabels[$order->status] ?? $order->status }}</x-admin.badge></td>
                        <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{{ $order->created_at->format('d/m/Y H:i') }}</td>
                        <td class="col-actions px-6 py-4">
                            <x-admin.action-menu>
                                <x-admin.action-link :href="route('admin.orders.show', $order->id)">Détails</x-admin.action-link>
                                <x-admin.action-link :href="route('order.track', $order->id)" target="_blank">Suivi client</x-admin.action-link>
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8"><x-admin.empty title="Aucune commande" /></td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$orders->total()" label="commande" label-plural="commandes" />
        @if($orders->hasPages()){{ $orders->links() }}@endif
    </div>
</div>
