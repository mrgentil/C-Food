@php
    use App\Support\OrderPayment;
    $payment = OrderPayment::summary($order);
    $paidBadge = match ($payment['payment_status']) {
        'paid' => 'bg-green-100 text-green-800 border-green-200',
        'pending_cash' => 'bg-amber-100 text-amber-900 border-amber-200',
        'cancelled' => 'bg-gray-100 text-gray-700 border-gray-200',
        default => 'bg-red-100 text-red-800 border-red-200',
    };
@endphp

<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Paiement & facture</h3>
        <span class="inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold {{ $paidBadge }}">
            {{ $payment['payment_status_label'] }}
        </span>
    </div>

    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
        <div>
            <dt class="text-gray-500">N° facture</dt>
            <dd class="font-semibold text-gray-900">{{ $payment['invoice_number'] }}</dd>
        </div>
        <div>
            <dt class="text-gray-500">Commande</dt>
            <dd class="font-mono text-xs text-gray-800">{{ $order->id }}</dd>
        </div>
        <div>
            <dt class="text-gray-500">Mode de paiement</dt>
            <dd class="font-semibold">{{ $payment['payment_method_label'] }}</dd>
        </div>
        @if(($payment['payment_method'] ?? '') === 'cash')
        <div>
            <dt class="text-gray-500">Espèces encaissées</dt>
            <dd class="font-semibold">{{ $payment['cash_collected_at_label'] ?? 'En attente (livreur)' }}</dd>
        </div>
        @endif
        <div>
            <dt class="text-gray-500">Payé le</dt>
            <dd class="font-semibold">{{ $payment['paid_at_label'] ?? '—' }}</dd>
        </div>
        <div class="sm:col-span-2">
            <dt class="text-gray-500">Référence transaction</dt>
            <dd class="font-mono text-xs break-all">{{ $payment['transaction_id'] ?? '—' }}</dd>
        </div>
    </dl>

    @if($printRoute ?? null)
        <a href="{{ $printRoute }}" target="_blank" rel="noopener"
           class="mt-4 inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800 hover:bg-orange-100">
            Imprimer la facture
        </a>
    @endif
</div>
