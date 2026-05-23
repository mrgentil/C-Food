<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Suivi de commande #{{ $order->id }}</title>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-2xl mx-auto py-12 px-4">
        <div class="bg-white rounded-2xl shadow-lg p-8">
            <div class="text-center mb-8">
                <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-900">Commande #{{ $order->id }}</h1>
                <p class="text-gray-600 mt-1">{{ $order->restaurant->name }}</p>
            </div>

            @php
                $statusFlow = ['pending', 'preparing', 'picked_up', 'delivering', 'delivered'];
                $currentStep = array_search($order->status, $statusFlow);
                $statusLabels = [
                    'pending' => 'Commande reçue',
                    'preparing' => 'En préparation',
                    'picked_up' => 'Récupérée',
                    'delivering' => 'En livraison',
                    'delivered' => 'Livrée',
                    'cancelled' => 'Annulée'
                ];
            @endphp

            @if($order->status === 'cancelled')
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p class="text-red-800 font-semibold">Cette commande a été annulée</p>
                </div>
            @else
                <!-- Progress Bar -->
                <div class="mb-8">
                    <div class="flex justify-between mb-2">
                        @foreach($statusFlow as $index => $status)
                            <div class="flex flex-col items-center flex-1">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center
                                    @if($index <= $currentStep) bg-orange-500 text-white
                                    @else bg-gray-200 text-gray-400 @endif">
                                    @if($index < $currentStep)
                                        ✓
                                    @else
                                        {{ $index + 1 }}
                                    @endif
                                </div>
                                <span class="text-xs mt-1 text-center
                                    @if($index <= $currentStep) text-orange-600 font-semibold
                                    @else text-gray-400 @endif">
                                    {{ $statusLabels[$status] }}
                                </span>
                            </div>
                            @if($index < count($statusFlow) - 1)
                                <div class="flex-1 h-1 mt-4
                                    @if($index < $currentStep) bg-orange-500 @else bg-gray-200 @endif"></div>
                            @endif
                        @endforeach
                    </div>
                </div>

                <!-- Order Info -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 class="font-semibold text-gray-900 mb-3">Articles commandés</h3>
                    @foreach($order->items as $item)
                        <div class="flex justify-between py-2 border-b last:border-0">
                            <span>{{ $item->quantity }}x {{ $item->menuItem->name }}</span>
                            <span class="font-medium">{{ number_format($item->quantity * $item->unit_price, 2) }} €</span>
                        </div>
                    @endforeach
                    <div class="flex justify-between pt-3 font-bold">
                        <span>Total</span>
                        <span>{{ number_format($order->total, 2) }} €</span>
                    </div>
                </div>

                <!-- Estimated Time -->
                @if($order->status !== 'delivered')
                    <div class="text-center text-gray-600">
                        <p class="text-sm">Temps estimé de livraison</p>
                        <p class="text-xl font-bold text-orange-600">
                            {{ $order->created_at->addMinutes(45)->format('H:i') }}
                        </p>
                    </div>
                @else
                    <div class="text-center bg-green-50 rounded-lg p-4">
                        <p class="text-green-800 font-semibold">✓ Commande livrée avec succès !</p>
                    </div>
                @endif
            @endif

            <div class="mt-8 text-center">
                <a href="/" class="text-orange-500 hover:text-orange-600 font-medium">
                    ← Retour à l'accueil
                </a>
            </div>
        </div>
    </div>

    <!-- Auto-refresh every 30 seconds if not delivered -->
    @if(!in_array($order->status, ['delivered', 'cancelled']))
        <script>
            setTimeout(() => { window.location.reload(); }, 30000);
        </script>
    @endif
</body>
</html>
