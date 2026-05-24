@extends('layouts.app')

@section('header')
    <div class="flex items-center justify-between">
        <x-admin.page-header title="Paiements Marchands" subtitle="Gérez les versements (payouts) aux établissements partenaires." />
    </div>
@endsection

@section('content')
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        
        <!-- Formulaire de Génération -->
        <div class="lg:col-span-1">
            <x-admin.card title="Générer des paiements">
                <form action="{{ route('admin.payouts.generate') }}" method="POST" class="space-y-4 mt-4">
                    @csrf
                    <div>
                        <label class="block text-sm font-medium text-white mb-1">Du (Début)</label>
                        <input type="date" name="period_start" required class="admin-input" value="{{ old('period_start', now()->subMonth()->startOfMonth()->format('Y-m-d')) }}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-white mb-1">Au (Fin)</label>
                        <input type="date" name="period_end" required class="admin-input" value="{{ old('period_end', now()->subMonth()->endOfMonth()->format('Y-m-d')) }}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-white mb-1">Taux de Commission (%)</label>
                        <input type="number" step="0.1" name="commission_rate" required class="admin-input" value="15.0">
                        <p class="text-[10px] text-dark-muted mt-1">Sera déduit du CA total de chaque restaurant.</p>
                    </div>

                    <div class="pt-2">
                        <x-admin.button type="submit" variant="primary" class="w-full justify-center">
                            Calculer les versements
                        </x-admin.button>
                    </div>
                </form>
            </x-admin.card>
        </div>

        <!-- Liste des Payouts -->
        <div class="lg:col-span-3">
            <x-admin.data-panel title="Historique des versements" description="Liste des paiements en attente et payés.">
                <table class="admin-table min-w-full">
                    <thead>
                        <tr>
                            <th class="px-6 py-3 text-left">Établissement</th>
                            <th class="px-6 py-3 text-left">Période</th>
                            <th class="px-6 py-3 text-left">Ventes Nettes</th>
                            <th class="px-6 py-3 text-left">Commission</th>
                            <th class="px-6 py-3 text-left">À Verser</th>
                            <th class="px-6 py-3 text-left">Statut</th>
                            <th class="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($payouts as $payout)
                            <tr>
                                <td class="px-6 py-4">
                                    <p class="text-sm font-semibold text-white">{{ $payout->restaurant->name }}</p>
                                    <p class="text-xs text-dark-muted">ID: {{ substr($payout->restaurant->id, 0, 8) }}</p>
                                </td>
                                <td class="px-6 py-4 text-sm text-dark-muted">
                                    {{ $payout->period_start->format('d/m/y') }} - {{ $payout->period_end->format('d/m/y') }}
                                </td>
                                <td class="px-6 py-4 text-sm text-dark-muted">
                                    {{ number_format($payout->total_sales, 0, ',', ' ') }} FC
                                </td>
                                <td class="px-6 py-4 text-sm text-rose-500 font-medium">
                                    - {{ number_format($payout->commission_amount, 0, ',', ' ') }} FC
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-white">
                                    {{ number_format($payout->net_payout, 0, ',', ' ') }} FC
                                </td>
                                <td class="px-6 py-4">
                                    @if($payout->status === 'paid')
                                        <x-admin.badge variant="green">Payé le {{ $payout->paid_at->format('d/m/Y') }}</x-admin.badge>
                                    @else
                                        <x-admin.badge variant="amber">En attente</x-admin.badge>
                                    @endif
                                </td>
                                <td class="px-6 py-4">
                                    @if($payout->status === 'pending')
                                        <form action="{{ route('admin.payouts.markAsPaid', $payout) }}" method="POST" class="inline" onsubmit="return confirm('Confirmer le versement ? Cette action est irréversible.');">
                                            @csrf @method('PUT')
                                            <button type="submit" class="text-xs text-emerald-500 hover:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded">
                                                Marquer Payé
                                            </button>
                                        </form>
                                    @else
                                        <span class="text-xs text-dark-muted">Réf: {{ $payout->reference_number }}</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="px-6 py-4 text-center text-sm text-dark-muted">Aucun versement trouvé.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
                <div class="px-6 py-4 border-t border-dark-border">
                    {{ $payouts->links() }}
                </div>
            </x-admin.data-panel>
        </div>

    </div>
@endsection
