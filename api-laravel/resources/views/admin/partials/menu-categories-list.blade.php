<div id="menu-categories-list" class="admin-live-region border-t border-slate-100" data-live-url="{{ route('admin.menuCategories') }}">
    <div class="admin-live-overlay" aria-hidden="true"><div class="admin-live-spinner" role="status"></div></div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table admin-table-wide min-w-full">
            <thead>
                <tr>
                    <th class="text-left">Établissement</th>
                    <th class="text-left">Nom</th>
                    <th class="col-num">Ordre</th>
                    <th class="col-num">Actif</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($rows as $row)
                    <tr>
                        <td class="text-sm"><div class="font-medium text-slate-900">{{ $row->restaurant->name ?? '—' }}</div><div class="text-xs text-slate-500">{{ $row->restaurant->type ?? '' }}</div></td>
                        <td class="text-sm font-semibold text-slate-900">{{ $row->name }}</td>
                        <td class="col-num text-sm text-slate-600">{{ $row->sort_order }}</td>
                        <td class="col-num">@if($row->is_available)<x-admin.badge variant="green">Oui</x-admin.badge>@else<x-admin.badge variant="red">Non</x-admin.badge>@endif</td>
                        <td class="col-actions">
                            <x-admin.action-menu>
                                <x-admin.action-link :href="route('admin.menuCategories.edit', $row)">Modifier</x-admin.action-link>
                                <form method="POST" action="{{ route('admin.menuCategories.destroy', $row) }}" onsubmit="return confirm('Supprimer cette section ?')">
                                    @csrf @method('DELETE')
                                    <x-admin.action-link type="submit" variant="danger">Supprimer</x-admin.action-link>
                                </form>
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <x-admin.empty title="Aucune section" :colspan="5" />
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$rows->total()" label="section" label-plural="sections" />
        @if($rows->hasPages()){{ $rows->links() }}@endif
    </div>
</div>
