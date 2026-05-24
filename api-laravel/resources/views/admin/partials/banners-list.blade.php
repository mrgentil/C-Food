<div id="banners-list" class="admin-live-region border-t border-dark-border" data-live-url="{{ route('admin.banners') }}">
    <div class="admin-live-overlay" aria-hidden="true"><div class="admin-live-spinner" role="status"></div></div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table admin-table-wide min-w-full">
            <thead>
                <tr>
                    <th class="text-left w-20">Image</th>
                    <th class="text-left">Titre</th>
                    <th class="text-left">Sous-titre</th>
                    <th class="col-num w-16">Couleur</th>
                    <th class="text-left">Action</th>
                    <th class="col-num">Ordre</th>
                    <th class="col-num">Statut</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($banners as $banner)
                    <tr>
                        <td>
                            @if($banner->image)
                                <img src="{{ $banner->image }}" alt="{{ $banner->title }}" class="w-16 h-10 object-cover rounded-lg">
                            @else
                                <div class="w-16 h-10 rounded-lg flex items-center justify-center text-dark-muted text-xs border border-dark-border" style="background-color: {{ $banner->color }}">
                                    <span class="text-white text-[10px] font-bold">PUB</span>
                                </div>
                            @endif
                        </td>
                        <td class="text-sm font-semibold text-white">{{ $banner->title }}</td>
                        <td class="text-sm text-dark-muted">{{ Str::limit($banner->subtitle, 40) }}</td>
                        <td class="col-num">
                            <div class="flex items-center justify-center gap-1.5">
                                <span class="w-4 h-4 rounded-full inline-block border border-dark-border" style="background-color: {{ $banner->color }}"></span>
                                <span class="font-mono text-dark-muted text-xs">{{ $banner->color }}</span>
                            </div>
                        </td>
                        <td class="text-sm text-dark-muted">
                            @if($banner->action_type && $banner->action_type !== 'none')
                                <x-admin.badge variant="blue">{{ ucfirst($banner->action_type) }}</x-admin.badge>
                            @else
                                <span class="text-xs text-dark-muted">—</span>
                            @endif
                        </td>
                        <td class="col-num font-mono text-dark-muted text-sm">{{ $banner->order_index }}</td>
                        <td class="col-num">
                            @if($banner->is_active)
                                <x-admin.badge variant="green">Actif</x-admin.badge>
                            @else
                                <x-admin.badge>Inactif</x-admin.badge>
                            @endif
                        </td>
                        <td class="col-actions">
                            <x-admin.action-menu>
                                <x-admin.action-link :href="route('admin.banners.edit', $banner)">Modifier</x-admin.action-link>
                                <form method="POST" action="{{ route('admin.banners.destroy', $banner) }}" onsubmit="return confirm('Supprimer cette publicité ?');">
                                    @csrf @method('DELETE')
                                    <x-admin.action-link type="submit" variant="danger">Supprimer</x-admin.action-link>
                                </form>
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <x-admin.empty title="Aucune publicité trouvée" :colspan="8" />
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$banners->total()" label="publicité" label-plural="publicités" />
        @if($banners->hasPages()){{ $banners->links() }}@endif
    </div>
</div>
