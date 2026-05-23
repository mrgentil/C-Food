@php($typeLabels = ['restaurant' => 'Restaurant', 'grocery' => 'Épicerie', 'supermarket' => 'Supermarché', 'alcohol' => 'Alcool', 'flowers' => 'Fleurs', 'pharmacy' => 'Pharmacie', 'pet' => 'Animalerie'])
<div id="restaurants-list" class="admin-live-region border-t border-slate-100" data-live-url="{{ route('admin.restaurants') }}">
    <div class="admin-live-overlay" aria-hidden="true"><div class="admin-live-spinner" role="status"></div></div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table min-w-full" style="min-width: 1100px;">
            <thead>
                <tr>
                    <th class="col-id-uuid text-left">ID</th>
                    <th class="col-rest-name text-left">Nom</th>
                    <th class="col-num text-center">Note</th>
                    <th class="col-delivery text-left">Livraison</th>
                    <th class="col-num text-center">Art.</th>
                    <th class="col-num text-center">Cmd.</th>
                    <th class="col-type text-left">Type</th>
                    <th class="col-owner text-left">Propriétaire</th>
                    <th class="col-status text-left">Statut</th>
                    <th class="col-actions text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($restaurants as $restaurant)
                    <tr>
                        <td class="col-id-uuid text-sm font-mono text-slate-500">#{{ substr($restaurant->id, 0, 8) }}</td>
                        <td class="col-rest-name">
                            <div class="admin-cell-name">
                                <div class="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                    @if($restaurant->image)<img class="h-full w-full object-cover" src="{{ $restaurant->image }}" alt="">@else<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/></svg>@endif
                                </div>
                                <span class="text-sm font-semibold text-slate-900 truncate" title="{{ $restaurant->name }}">{{ $restaurant->name }}</span>
                            </div>
                        </td>
                        <td class="col-num text-sm text-center"><span class="font-bold">{{ number_format($restaurant->rating, 1) }}</span><span class="text-slate-400 text-xs">/5</span></td>
                        <td class="col-delivery text-sm text-slate-600 text-left"><div>{{ $restaurant->delivery_time }}</div><div class="text-xs text-slate-500">{{ number_format($restaurant->delivery_fee) }} FC</div></td>
                        <td class="col-num text-sm font-medium text-center">{{ $restaurant->menu_items_count }}</td>
                        <td class="col-num text-sm font-medium text-center">{{ $restaurant->orders_count }}</td>
                        <td class="col-type text-left"><x-admin.badge variant="blue">{{ $typeLabels[$restaurant->type ?? 'restaurant'] ?? $restaurant->type }}</x-admin.badge></td>
                        <td class="col-owner text-sm text-left">@if($restaurant->owner)<div class="font-medium text-slate-900 truncate">{{ $restaurant->owner->name }}</div><div class="text-xs text-slate-500 truncate">{{ $restaurant->owner->email }}</div>@else—@endif</td>
                        <td class="col-status text-left">@if($restaurant->is_open)<x-admin.badge variant="green">Ouvert</x-admin.badge>@else<x-admin.badge variant="red">Fermé</x-admin.badge>@endif</td>
                        <td class="col-actions">
                            @php($deleteConfirm = 'Supprimer « '.$restaurant->name.' » ? Action irréversible.')
                            <x-admin.action-menu>
                                <x-admin.action-link :href="route('admin.restaurants.edit', $restaurant)">Modifier</x-admin.action-link>
                                <form method="POST" action="{{ route('admin.restaurants.destroy', $restaurant) }}" onsubmit="return confirm(@json($deleteConfirm))">
                                    @csrf @method('DELETE')
                                    <x-admin.action-link type="submit" variant="danger">Supprimer</x-admin.action-link>
                                </form>
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <x-admin.empty title="Aucun établissement" :colspan="10">
                        <x-slot name="action"><x-admin.button :href="route('admin.restaurants.create')" variant="primary" size="sm">Créer</x-admin.button></x-slot>
                    </x-admin.empty>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$restaurants->total()" label="établissement" label-plural="établissements" />
        @if($restaurants->hasPages()){{ $restaurants->links() }}@endif
    </div>
</div>
