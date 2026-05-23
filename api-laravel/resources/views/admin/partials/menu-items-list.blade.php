<div id="menu-items-list" class="admin-live-region border-t border-slate-100" data-live-url="{{ route('admin.menuItems') }}">
    <div class="admin-live-overlay" aria-hidden="true"><div class="admin-live-spinner" role="status"></div></div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table admin-table-wide min-w-full">
            <thead>
                <tr>
                    <th class="text-left">Article</th>
                    <th class="text-left">Établissement</th>
                    <th class="text-left">Section</th>
                    <th class="col-num">Prix</th>
                    <th class="col-num">Actif</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($rows as $row)
                    <tr>
                        <td>
                            <div class="admin-cell-name">
                                @if($row->image)<img class="h-10 w-10 rounded-xl object-cover shrink-0" src="{{ $row->image }}" alt="">@else<div class="h-10 w-10 rounded-xl bg-slate-100 shrink-0"></div>@endif
                                <span class="text-sm font-semibold text-slate-900" title="{{ $row->name }}">{{ $row->name }}</span>
                            </div>
                        </td>
                        <td class="text-sm"><div class="font-medium text-slate-900">{{ $row->restaurant->name ?? '—' }}</div><div class="text-xs text-slate-500">{{ $row->restaurant->type ?? '' }}</div></td>
                        <td class="text-sm text-slate-600">{{ $row->category ?? ($row->category->name ?? '—') }}</td>
                        <td class="col-num text-sm font-semibold text-slate-900">{{ number_format((int) $row->price, 0, '.', ' ') }}</td>
                        <td class="col-num">@if($row->is_available)<x-admin.badge variant="green">Oui</x-admin.badge>@else<x-admin.badge variant="red">Non</x-admin.badge>@endif</td>
                        <td class="col-actions">
                            <x-admin.action-menu>
                                <x-admin.action-link :href="route('admin.menuItems.edit', $row)">Modifier</x-admin.action-link>
                                <form method="POST" action="{{ route('admin.menuItems.destroy', $row) }}" onsubmit="return confirm('Supprimer cet article ?')">
                                    @csrf @method('DELETE')
                                    <x-admin.action-link type="submit" variant="danger">Supprimer</x-admin.action-link>
                                </form>
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <x-admin.empty title="Aucun article" :colspan="6" />
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$rows->total()" label="article" label-plural="articles" />
        @if($rows->hasPages()){{ $rows->links() }}@endif
    </div>
</div>
