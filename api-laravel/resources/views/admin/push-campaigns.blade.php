@extends('layouts.app')

@section('header')
    <div class="flex items-center justify-between">
        <x-admin.page-header title="Notifications Push" subtitle="Envoyez des messages ciblés à vos utilisateurs pour booster l'engagement." />
    </div>
@endsection

@section('content')
    @if(session('success'))
        <div class="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ session('success') }}
        </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Formulaire d'envoi -->
        <div class="lg:col-span-1">
            <x-admin.card title="Nouvelle Campagne">
                <form action="{{ route('admin.push.store') }}" method="POST" class="space-y-5 mt-4">
                    @csrf
                    <div>
                        <label class="block text-sm font-medium text-white mb-1">Titre de la notification</label>
                        <input type="text" name="title" required placeholder="Ex: Promo du Soir 🍔" class="admin-input" value="{{ old('title') }}">
                        @error('title') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-white mb-1">Message</label>
                        <textarea name="body" required rows="3" placeholder="Profitez de -20% sur tous les burgers avec le code BURGER20 !" class="admin-textarea">{{ old('body') }}</textarea>
                        @error('body') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-white mb-1">Cible</label>
                        <select name="target_audience" required class="admin-select">
                            <option value="all">Tous les utilisateurs</option>
                            <option value="clients">Clients uniquement</option>
                            <option value="drivers">Livreurs uniquement</option>
                            <option value="merchants">Marchands uniquement</option>
                        </select>
                        @error('target_audience') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>

                    <div class="pt-2">
                        <x-admin.button type="submit" variant="primary" class="w-full justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            Envoyer la campagne
                        </x-admin.button>
                        <p class="text-xs text-dark-muted text-center mt-3">L'envoi est immédiat et irréversible.</p>
                    </div>
                </form>
            </x-admin.card>
        </div>

        <!-- Historique -->
        <div class="lg:col-span-2">
            <x-admin.data-panel title="Historique des campagnes" description="Liste des notifications envoyées récemment.">
                <table class="admin-table min-w-full">
                    <thead>
                        <tr>
                            <th class="px-6 py-3 text-left">Date</th>
                            <th class="px-6 py-3 text-left">Message</th>
                            <th class="px-6 py-3 text-left">Cible</th>
                            <th class="px-6 py-3 text-left">Envoyés</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($campaigns as $campaign)
                            <tr>
                                <td class="px-6 py-4 text-sm text-dark-muted whitespace-nowrap">
                                    {{ $campaign->created_at->format('d/m/Y H:i') }}
                                </td>
                                <td class="px-6 py-4">
                                    <p class="text-sm font-semibold text-white">{{ $campaign->title }}</p>
                                    <p class="text-xs text-dark-muted truncate max-w-xs">{{ $campaign->body }}</p>
                                </td>
                                <td class="px-6 py-4 text-sm text-dark-muted">
                                    @php
                                        $targets = [
                                            'all' => 'Tous',
                                            'clients' => 'Clients',
                                            'drivers' => 'Livreurs',
                                            'merchants' => 'Marchands'
                                        ];
                                    @endphp
                                    {{ $targets[$campaign->target_audience] ?? $campaign->target_audience }}
                                </td>
                                <td class="px-6 py-4 text-sm font-medium text-white">
                                    <x-admin.badge variant="blue">{{ $campaign->sent_count }} succès</x-admin.badge>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="px-6 py-4 text-center text-sm text-dark-muted">Aucune campagne envoyée.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
                <div class="px-6 py-4 border-t border-dark-border">
                    {{ $campaigns->links() }}
                </div>
            </x-admin.data-panel>
        </div>

    </div>
@endsection
