<div id="users-list" class="admin-live-region border-t border-slate-100" data-live-url="{{ route('admin.users') }}">
    <div class="admin-live-overlay" aria-hidden="true">
        <div class="admin-live-spinner" role="status" aria-label="Chargement…"></div>
    </div>
    <div class="admin-live-content overflow-x-auto">
        <table class="admin-table min-w-full">
            <thead>
                <tr>
                    <th class="col-id text-left">ID</th>
                    <th class="col-name text-left">Nom</th>
                    <th class="col-email text-left">Email</th>
                    <th class="col-phone text-left">Téléphone</th>
                    <th class="col-role text-left">Rôle</th>
                    <th class="col-num">Cmd.</th>
                    <th class="col-num">Étab.</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($users as $user)
                    <tr>
                        <td class="col-id text-sm font-mono text-slate-500">#{{ $user->id }}</td>
                        <td class="col-name">
                            <div class="admin-cell-name">
                                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                                    {{ strtoupper(substr($user->name, 0, 1)) }}
                                </div>
                                <span class="text-sm font-medium text-slate-900" title="{{ $user->name }}">{{ $user->name }}</span>
                            </div>
                        </td>
                        <td class="col-email text-sm text-slate-600" title="{{ $user->email }}">{{ $user->email }}</td>
                        <td class="col-phone text-sm text-slate-600">{{ $user->phone ?? '—' }}</td>
                        <td class="col-role">
                            <div class="flex flex-wrap gap-1">
                                @if($user->is_admin)
                                    <x-admin.badge variant="red">Admin</x-admin.badge>
                                @endif
                                @if($user->is_merchant || $user->is_restaurant)
                                    <x-admin.badge variant="blue">Marchand</x-admin.badge>
                                @endif
                                @if($user->is_driver)
                                    <x-admin.badge variant="amber">Livreur</x-admin.badge>
                                    @php($vStatus = $user->driver_verification_status ?? 'pending')
                                    @if($vStatus === 'approved')
                                        <x-admin.badge variant="green">Vérifié</x-admin.badge>
                                    @elseif($vStatus === 'rejected')
                                        <x-admin.badge variant="red">Refusé</x-admin.badge>
                                    @else
                                        <x-admin.badge variant="yellow">En attente</x-admin.badge>
                                    @endif
                                @endif
                                @if(!$user->is_admin && !($user->is_merchant || $user->is_restaurant) && !$user->is_driver)
                                    <x-admin.badge>Client</x-admin.badge>
                                @endif
                            </div>
                        </td>
                        <td class="col-num text-sm font-medium text-slate-700">{{ $user->orders_count }}</td>
                        <td class="col-num text-sm">
                            @if(($user->is_merchant || $user->is_restaurant) && ($user->stores_count ?? 0) > 0)
                                <a class="font-semibold text-brand-700 hover:text-brand-800"
                                   href="{{ route('admin.restaurants', ['owner_user_id' => $user->id]) }}">
                                    {{ $user->stores_count }}
                                </a>
                            @elseif($user->is_merchant || $user->is_restaurant)
                                <span class="text-slate-400">0</span>
                            @else
                                <span class="text-slate-300">—</span>
                            @endif
                        </td>
                        <td class="col-actions">
                            <x-admin.action-menu>
                                @if($user->is_driver)
                                    <x-admin.action-link :href="route('admin.users.edit', $user) . '#driver-verification'">Dossier livreur</x-admin.action-link>
                                @endif
                                <x-admin.action-link :href="route('admin.users.edit', $user)">Modifier</x-admin.action-link>
                                @if($user->id !== auth()->id())
                                    <form action="{{ route('admin.users.toggleSuspend', $user) }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="close_stores" value="1" />
                                        @if(empty($user->suspended_at))
                                            <x-admin.action-link type="submit" variant="warning" onclick="return confirm('Suspendre ce compte ?');">Suspendre</x-admin.action-link>
                                        @else
                                            <x-admin.action-link type="submit" variant="warning">Réactiver</x-admin.action-link>
                                        @endif
                                    </form>
                                    <form action="{{ route('admin.users.destroy', $user) }}" method="POST" onsubmit="return confirm('Supprimer cet utilisateur ?');">
                                        @csrf
                                        @method('DELETE')
                                        <x-admin.action-link type="submit" variant="danger">Supprimer</x-admin.action-link>
                                    </form>
                                @endif
                            </x-admin.action-menu>
                        </td>
                    </tr>
                @empty
                    <x-admin.empty title="Aucun utilisateur" description="Créez un compte ou modifiez vos filtres." :colspan="8">
                        <x-slot name="action">
                            <x-admin.button :href="route('admin.users.create')" variant="primary" size="sm">Ajouter un utilisateur</x-admin.button>
                        </x-slot>
                    </x-admin.empty>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="admin-live-footer">
        <x-admin.live-count :total="$users->total()" label="utilisateur" label-plural="utilisateurs" />
        @if($users->hasPages())
            {{ $users->links() }}
        @endif
    </div>
</div>
