<div id="categories-list" class="admin-live-region border-t border-slate-100" data-live-url="{{ route('admin.categories', ['scope' => $scope ?? 'home']) }}">
    <div class="admin-live-overlay" aria-hidden="true"><div class="admin-live-spinner" role="status"></div></div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table admin-table-wide min-w-full">
            <thead>
                <tr>
                    <th class="text-left">Nom</th>
                    <th class="text-left">Type</th>
                    <th class="col-num">Accueil</th>
                    <th class="text-left">Icône</th>
                    <th class="text-left">Couleur</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($categories as $category)
                    <tr>
                        <td class="text-sm font-semibold text-slate-900">{{ $category->name }}</td>
                        <td class="text-sm text-slate-600 font-mono">{{ $category->store_type ?? '—' }}</td>
                        <td class="col-num">@if($category->show_on_home)<x-admin.badge variant="green">Oui</x-admin.badge>@else<x-admin.badge>Non</x-admin.badge>@endif</td>
                        <td class="text-sm text-slate-600">@if($category->icon)<span class="text-xs">{{ $category->icon }}</span>@else—@endif</td>
                        <td class="text-sm"><span class="inline-block w-4 h-4 rounded border align-middle" style="background:{{ $category->color }}"></span> <span class="font-mono text-xs text-slate-500">{{ $category->color }}</span></td>
                        <td class="col-actions">
                            <x-admin.action-menu>
                                <x-admin.action-link :href="route('admin.categories.edit', $category)">Modifier</x-admin.action-link>
                                <form method="POST" action="{{ route('admin.categories.destroy', $category) }}" onsubmit="return confirm('Supprimer cette catégorie ?');">
                                    @csrf @method('DELETE')
                                    <x-admin.action-link type="submit" variant="danger">Supprimer</x-admin.action-link>
                                </form>
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <x-admin.empty title="Aucune catégorie" :colspan="6" />
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$categories->total()" label="catégorie" label-plural="catégories" />
        @if($categories->hasPages()){{ $categories->links() }}@endif
    </div>
</div>
