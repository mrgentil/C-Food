@extends('layouts.app')

@section('head')
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
@endsection

@section('header')
    <x-admin.page-header title="Dashboard" subtitle="Vue d'ensemble de la plateforme C-Food." />
@endsection

@section('content')
    <!-- Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <x-admin.stat-card label="Commandes totales" :value="$stats['orders_count']" color="blue">
            <x-slot name="icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </x-slot>
        </x-admin.stat-card>
        <x-admin.stat-card label="Utilisateurs" :value="$stats['users_count']" color="green">
            <x-slot name="icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </x-slot>
        </x-admin.stat-card>
        <x-admin.stat-card label="Établissements" :value="$stats['restaurants_count']" color="amber">
            <x-slot name="icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </x-slot>
        </x-admin.stat-card>
        <x-admin.stat-card label="Revenu total" :value="number_format($stats['revenue']) . ' FC'" color="rose">
            <x-slot name="icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </x-slot>
        </x-admin.stat-card>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2">
            <x-admin.card title="Revenus (30 derniers jours)">
                <div class="h-[300px]"><canvas id="revenueChart"></canvas></div>
            </x-admin.card>
        </div>
        <div class="lg:col-span-1">
            <x-admin.card title="Répartition des commandes">
                <div class="h-[300px]"><canvas id="statusChart"></canvas></div>
            </x-admin.card>
        </div>
    </div>

    <!-- Top Restaurants & Recent Orders Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Top 5 Restaurants -->
        <div class="lg:col-span-1">
            <x-admin.card title="Top 5 Établissements">
                <ul class="divide-y divide-gray-100 dark:divide-gray-800">
                    @foreach($topRestaurants as $idx => $rest)
                        <li class="py-3 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-sm">
                                    {{ $idx + 1 }}
                                </div>
                                <div>
                                    <p class="text-sm font-semibold text-white">{{ $rest->name }}</p>
                                    <p class="text-xs text-dark-muted">{{ $rest->type }}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold text-white">{{ $rest->orders_count }}</p>
                                <p class="text-xs text-dark-muted">cmdes</p>
                            </div>
                        </li>
                    @endforeach
                </ul>
            </x-admin.card>
        </div>

        <!-- Recent Orders -->
        <div class="lg:col-span-2">
            <x-admin.data-panel title="Commandes récentes" description="Dernières activités sur la plateforme.">
                <table class="admin-table min-w-full">
                    <thead>
                        <tr>
                            <th class="px-6 py-3 text-left">ID</th>
                            <th class="px-6 py-3 text-left">Client</th>
                            <th class="px-6 py-3 text-left">Total</th>
                            <th class="px-6 py-3 text-left">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentOrders as $order)
                            <tr>
                                <td class="px-6 py-4 text-sm font-semibold text-white"><a href="{{ route('admin.orders.show', $order) }}" class="hover:text-brand-500">#{{ str_pad($order->id, 4, '0', STR_PAD_LEFT) }}</a></td>
                                <td class="px-6 py-4 text-sm text-dark-muted">{{ $order->user->name ?? 'N/A' }}</td>
                                <td class="px-6 py-4 text-sm font-medium text-white">{{ number_format($order->total, 0, ',', ' ') }} FC</td>
                                <td class="px-6 py-4">
                                    @php
                                        $statusColors = ['pending' => 'gray', 'preparing' => 'amber', 'picked_up' => 'blue', 'delivering' => 'indigo', 'delivered' => 'green', 'cancelled' => 'red'];
                                        $color = $statusColors[$order->status] ?? 'gray';
                                        $statusLabels = ['pending' => 'En attente', 'preparing' => 'Préparation', 'picked_up' => 'Récupérée', 'delivering' => 'En livraison', 'delivered' => 'Livrée', 'cancelled' => 'Annulée'];
                                        $label = $statusLabels[$order->status] ?? ucfirst($order->status);
                                    @endphp
                                    <x-admin.badge variant="{{ $color }}">{{ $label }}</x-admin.badge>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="px-6 py-4 text-center text-sm text-dark-muted">Aucune commande récente</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </x-admin.data-panel>
        </div>

    </div>
@endsection

@section('scripts')
    <script>
        // Use custom dark theme colors for text and grids
        Chart.defaults.color = '#a1a1aa'; // text-zinc-400
        Chart.defaults.scale.grid.color = '#27272a'; // border-zinc-800

        // 1. Revenue Chart
        const chartRevenue = @json($chartRevenue);
        new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels: chartRevenue.labels,
                datasets: [{
                    label: 'Revenu (FC)',
                    data: chartRevenue.data,
                    borderColor: '#f97316', // brand-500
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#1c1c1e',
                    pointBorderColor: '#f97316',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // 2. Status Doughnut Chart
        const chartStatus = @json($chartStatus);
        new Chart(document.getElementById('statusChart'), {
            type: 'doughnut',
            data: {
                labels: chartStatus.labels,
                datasets: [{
                    data: chartStatus.data,
                    backgroundColor: chartStatus.colors,
                    borderWidth: 0,
                    hoverOffset: 4
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
                    }
                }
            }
        });
    </script>
@endsection
