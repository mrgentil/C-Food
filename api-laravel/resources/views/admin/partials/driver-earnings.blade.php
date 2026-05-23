@if(!empty($driverStats))
    <div class="rounded-xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Gains livreur (API / commandes réelles)</h3>
        <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
                <dt class="text-gray-600">Courses livrées</dt>
                <dd class="text-xl font-bold text-gray-900">{{ $driverStats['delivered_count'] }}</dd>
            </div>
            <div>
                <dt class="text-gray-600">Courses annulées</dt>
                <dd class="text-xl font-bold text-gray-900">{{ $driverStats['cancelled_count'] }}</dd>
            </div>
            <div>
                <dt class="text-gray-600">Commissions cumulées (10 %)</dt>
                <dd class="text-xl font-bold text-emerald-800">
                    {{ number_format($driverStats['commission_total'], 0, '.', ' ') }} FC
                </dd>
            </div>
        </dl>
        <p class="mt-3 text-xs text-gray-600">
            Même calcul que l’app livreur (onglets Gains & Historique). Détail par commande : section
            <a href="{{ route('admin.orders') }}" class="text-orange-700 font-semibold hover:underline">Commandes admin</a>
            (filtre statut « Livrée », livreur {{ $user->name }}).
        </p>
    </div>
@endif
