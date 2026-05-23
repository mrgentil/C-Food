<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Facture {{ $payment['invoice_number'] }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>@media print { .no-print { display: none; } }</style>
</head>
<body class="bg-gray-50 text-gray-900 p-6">
    <div class="max-w-lg mx-auto bg-white rounded-xl shadow-sm border p-8">
        <div class="flex justify-between items-start mb-6">
            <div>
                <h1 class="text-2xl font-bold">C-Food</h1>
                <p class="text-sm text-gray-500">Facture / reçu de commande</p>
            </div>
            <div class="text-right text-sm">
                <p class="font-bold">{{ $payment['invoice_number'] }}</p>
                <p class="text-gray-500">{{ $order->created_at?->format('d/m/Y H:i') }}</p>
            </div>
        </div>

        <div class="mb-4 inline-block rounded-full px-3 py-1 text-sm font-bold
            {{ $payment['is_paid'] ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900' }}">
            {{ $payment['payment_status_label'] }}
        </div>

        <div class="text-sm space-y-1 mb-6">
            <p><strong>Client :</strong> {{ $order->user->name ?? '—' }}</p>
            <p><strong>Établissement :</strong> {{ $order->restaurant->name ?? '—' }}</p>
            <p><strong>Paiement :</strong> {{ $payment['payment_method_label'] }}</p>
            @if($payment['paid_at_label'])
                <p><strong>Payé le :</strong> {{ $payment['paid_at_label'] }}</p>
            @endif
            @if($payment['transaction_id'])
                <p><strong>Réf. :</strong> <span class="font-mono text-xs">{{ $payment['transaction_id'] }}</span></p>
            @endif
        </div>

        <table class="w-full text-sm mb-6">
            <thead>
                <tr class="border-b text-left text-gray-500">
                    <th class="py-2">Article</th>
                    <th class="py-2 text-right">Qté</th>
                    <th class="py-2 text-right">Prix</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                    <tr class="border-b border-gray-100">
                        <td class="py-2">{{ $item->menuItem->name ?? 'Article' }}</td>
                        <td class="py-2 text-right">{{ $item->quantity }}</td>
                        <td class="py-2 text-right">{{ number_format((int) $item->unit_price * (int) $item->quantity, 0, '.', ' ') }} FC</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="text-sm space-y-1 border-t pt-4">
            <div class="flex justify-between"><span>Sous-total</span><span>{{ number_format((int) $order->subtotal, 0, '.', ' ') }} FC</span></div>
            <div class="flex justify-between"><span>Livraison</span><span>{{ number_format((int) $order->delivery_fee, 0, '.', ' ') }} FC</span></div>
            <div class="flex justify-between"><span>Frais service</span><span>{{ number_format((int) $order->service_fee, 0, '.', ' ') }} FC</span></div>
            @if((int) $order->discount_amount > 0)
                <div class="flex justify-between text-green-700"><span>Remise</span><span>-{{ number_format((int) $order->discount_amount, 0, '.', ' ') }} FC</span></div>
            @endif
            @if((int) $order->tip > 0)
                <div class="flex justify-between"><span>Pourboire</span><span>{{ number_format((int) $order->tip, 0, '.', ' ') }} FC</span></div>
            @endif
            <div class="flex justify-between text-lg font-bold pt-2"><span>Total</span><span>{{ number_format((int) $order->total, 0, '.', ' ') }} FC</span></div>
        </div>

        <p class="mt-8 text-xs text-gray-400 text-center">Merci pour votre commande — C-Food</p>
    </div>

    <div class="no-print max-w-lg mx-auto mt-4 text-center">
        <button onclick="window.print()" class="rounded-lg bg-orange-600 text-white px-6 py-2 font-semibold">Imprimer</button>
    </div>
</body>
</html>
