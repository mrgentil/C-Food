<div id="brands-list" class="admin-live-region border-t border-dark-border" data-live-url="{{ route('admin.brands') }}">
    <div class="admin-live-overlay" aria-hidden="true"><div class="admin-live-spinner" role="status"></div></div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table admin-table-wide min-w-full">
            <thead>
                <tr>
                    <th class="text-left w-16">Logo</th>
                    <th class="text-left">Nom</th>
                    <th class="text-left">Type</th>
                    <th class="col-num">Ordre</th>
                    <th class="col-num">Statut</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($brands as $brand)
                    <tr>
                        <td>
                            @if($brand->logo)
                                <img src="{{ $brand->logo }}" alt="{{ $brand->name }}" class="w-10 h-10 object-contain bg-white rounded-lg p-1">
                            @else
                                <div class="w-10 h-10 bg-dark-bg rounded-lg flex items-center justify-center text-dark-muted text-xs border border-dark-border">
                                    N/A
                                </div>
                            @endif
                        </td>
                        <td class="text-sm font-semibold text-white">{{ $brand->name }}</td>
                        <td class="text-sm text-dark-muted font-mono">{{ $brand->type }}</td>
                        <td class="col-num font-mono text-dark-muted text-sm">{{ $brand->order_index }}</td>
                        <td class="col-num">
                            @if($brand->status)
                                <x-admin.badge variant="green">Actif</x-admin.badge>
                            @else
                                <x-admin.badge>Inactif</x-admin.badge>
                            @endif
                        </td>
                        <td class="col-actions">
                            <x-admin.action-menu>
                                <x-admin.action-link :href="route('admin.brands.edit', $brand)">Modifier</x-admin.action-link>
                                <form method="POST" action="{{ route('admin.brands.destroy', $brand) }}" onsubmit="return confirm('Supprimer cette marque ?');">
                                    @csrf @method('DELETE')
                                    <x-admin.action-link type="submit" variant="danger">Supprimer</x-admin.action-link>
                                </form>
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <x-admin.empty title="Aucune marque trouvée" :colspan="6" />
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$brands->total()" label="marque" label-plural="marques" />
        @if($brands->hasPages()){{ $brands->links() }}@endif
    </div>
</div>
