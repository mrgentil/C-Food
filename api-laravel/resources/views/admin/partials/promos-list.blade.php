<div id="promos-list" class="admin-live-region border-t border-slate-100" data-live-url="{{ route('admin.promos') }}">
    <div class="admin-live-overlay" aria-hidden="true"><div class="admin-live-spinner" role="status"></div></div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table admin-table-wide min-w-full">
            <thead>
                <tr>
                    <th class="text-left">Code</th>
                    <th class="text-left">Portée</th>
                    <th class="text-left">Type</th>
                    <th class="text-left">Valeur</th>
                    <th class="col-num">Min.</th>
                    <th class="text-left">Actif</th>
                    <th class="text-left">Période</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($promos as $p)
                    <tr>
                        <td class="text-sm font-semibold text-slate-900">{{ $p->code }}</td>
                        <td>@if(!empty($p->restaurant_id))<x-admin.badge variant="brand">Établ.</x-admin.badge>@else<x-admin.badge>Global</x-admin.badge>@endif</td>
                        <td class="text-sm text-slate-600">{{ $p->type }}</td>
                        <td class="text-sm text-slate-600">@if($p->type === 'percent'){{ $p->value }}%@else{{ number_format($p->value) }} FC @endif</td>
                        <td class="col-num text-sm text-slate-600">{{ number_format($p->min_subtotal ?? 0) }}</td>
                        <td>@if($p->is_active)<x-admin.badge variant="green">Actif</x-admin.badge>@else<x-admin.badge>Off</x-admin.badge>@endif</td>
                        <td class="text-sm text-slate-600 whitespace-nowrap">{{ $p->starts_at?->format('d/m/Y') ?? '—' }} → {{ $p->expires_at?->format('d/m/Y') ?? '—' }}</td>
                        <td class="col-actions">
                            <x-admin.action-menu>
                                <x-admin.action-link :href="route('admin.promos.edit', $p)">Éditer</x-admin.action-link>
                                <form method="POST" action="{{ route('admin.promos.destroy', $p) }}" onsubmit="return confirm('Supprimer ce code ?')">
                                    @csrf @method('DELETE')
                                    <x-admin.action-link type="submit" variant="danger">Supprimer</x-admin.action-link>
                                </form>
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <x-admin.empty title="Aucun code promo" :colspan="8" />
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$promos->total()" label="code" label-plural="codes" />
        @if($promos->hasPages()){{ $promos->links() }}@endif
    </div>
</div>
