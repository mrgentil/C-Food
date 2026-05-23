<div id="app-tabs-list" class="admin-live-region border-t border-slate-100" data-live-url="{{ route('admin.appTabs') }}">
    <div class="admin-live-overlay" aria-hidden="true"><div class="admin-live-spinner" role="status"></div></div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table admin-table-wide min-w-full">
            <thead>
                <tr>
                    <th class="col-num">Ordre</th>
                    <th class="text-left">Nom</th>
                    <th class="text-left">Slug</th>
                    <th class="text-left">Icône</th>
                    <th class="text-left">Statut</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($tabs as $tab)
                    <tr>
                        <td class="col-num text-sm text-slate-600">{{ $tab->sort_order }}</td>
                        <td class="text-sm font-semibold text-slate-900">
                            {{ $tab->name }}
                            @if($tab->is_home_tab)<x-admin.badge variant="brand" class="ml-1">Accueil</x-admin.badge>@endif
                        </td>
                        <td class="text-sm font-mono text-slate-600">{{ $tab->slug }}</td>
                        <td class="text-sm text-slate-600">{{ $tab->icon ?: '—' }}</td>
                        <td>@if($tab->is_published)<x-admin.badge variant="green">Publié</x-admin.badge>@else<x-admin.badge>Brouillon</x-admin.badge>@endif</td>
                        <td class="col-actions">
                            <x-admin.action-menu>
                                <form method="POST" action="{{ route('admin.appTabs.toggle', $tab) }}">
                                    @csrf
                                    <x-admin.action-link type="submit" variant="warning">{{ $tab->is_published ? 'Dépublier' : 'Publier' }}</x-admin.action-link>
                                </form>
                                <x-admin.action-link :href="route('admin.appTabs.edit', $tab)">Modifier</x-admin.action-link>
                                @unless($tab->is_home_tab)
                                    <form method="POST" action="{{ route('admin.appTabs.destroy', $tab) }}" onsubmit="return confirm('Supprimer cet onglet ?');">
                                        @csrf @method('DELETE')
                                        <x-admin.action-link type="submit" variant="danger">Supprimer</x-admin.action-link>
                                    </form>
                                @endunless
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <x-admin.empty title="Aucun onglet" :colspan="6" />
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$tabs->total()" label="onglet" label-plural="onglets" />
        @if($tabs->hasPages()){{ $tabs->links() }}@endif
    </div>
</div>
