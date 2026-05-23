@extends('layouts.restaurant')

@section('page-title', 'Détail commande')

@section('page-content')
    <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
            <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900">Commande #{{ $order->id }}</h3>
                    <a href="{{ route('restaurant.orders') }}" class="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        Retour
                    </a>
                </div>

                <div class="space-y-3">
                    @foreach($order->items as $item)
                        <div class="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                            <div>
                                <div class="font-semibold text-gray-900">{{ $item->quantity }}x {{ $item->menuItem->name ?? 'Article' }}</div>
                                <div class="text-sm text-gray-500">{{ $item->menuItem->category ?? '-' }}</div>
                                @if(!empty($item->special_instructions))
                                    <div class="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 border border-amber-100">
                                        <span class="font-semibold">Note client :</span> {{ $item->special_instructions }}
                                    </div>
                                @endif
                            </div>
                            <div class="text-sm font-semibold text-gray-900">{{ number_format(((int) $item->unit_price) * ((int) $item->quantity), 0, '.', ' ') }} FC</div>
                        </div>
                    @endforeach
                </div>
            </div>

            <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-lg font-semibold text-gray-900">
                    {{ ($order->order_type ?? 'delivery') === 'pickup' ? 'À emporter' : 'Adresse de livraison' }}
                </h3>
                <div class="text-sm text-gray-700">
                    @if(($order->order_type ?? 'delivery') === 'pickup')
                        <p class="text-gray-600">Le client récupère la commande à l’établissement.</p>
                    @elseif($order->address)
                        <div class="font-semibold">{{ $order->address->label ?? 'Adresse' }}</div>
                        <div>{{ $order->address->street ?? '' }}</div>
                        <div>{{ $order->address->neighborhood ?? '' }} {{ $order->address->city ?? '' }}</div>
                    @else
                        <div>Aucune adresse liée.</div>
                    @endif
                    <div class="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                        <span class="font-semibold text-gray-800">Instructions / notes commande :</span>
                        <span class="text-gray-700">{{ $order->delivery_instructions ?: '—' }}</span>
                    </div>
                </div>
            </div>

            @include('partials.order-delivery-proof', ['order' => $order])
        </div>

        <div class="space-y-6">
            <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-lg font-semibold text-gray-900">Actions</h3>
                @php
                    $statusLabels = [
                        'pending' => 'En attente',
                        'preparing' => 'Préparation',
                        'picked_up' => 'Récupérée',
                        'delivering' => 'En route',
                        'delivered' => 'Livrée',
                        'cancelled' => 'Annulée',
                    ];
                @endphp
                @include('restaurant.partials.order-action-buttons', ['order' => $order])
                @if(! in_array($order->status, ['pending', 'preparing', 'picked_up', 'delivering'], true))
                    <p class="mt-3 text-sm text-gray-500">Aucune action disponible pour ce statut ({{ $statusLabels[$order->status] ?? $order->status }}).</p>
                @endif
            </div>

            <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-lg font-semibold text-gray-900">Résumé</h3>
                <div class="space-y-2 text-sm text-gray-700">
                    <div><span class="font-semibold">Statut:</span> {{ $statusLabels[$order->status] ?? $order->status }}</div>
                    <div><span class="font-semibold">Client:</span> {{ $order->user->name ?? '-' }}</div>
                    <div><span class="font-semibold">Téléphone:</span> {{ $order->user->phone ?? '-' }}</div>
                    <div><span class="font-semibold">Établissement:</span> {{ $order->restaurant->name ?? '-' }}</div>
                    <div><span class="font-semibold">Livreur:</span> {{ $order->driver->name ?? 'Non assigné' }}</div>
                    @if($order->driver)
                        <div><span class="font-semibold">Téléphone livreur:</span> {{ $order->driver->phone ?? '-' }}</div>
                    @endif
                    <div><span class="font-semibold">Date:</span> {{ $order->created_at?->format('d/m/Y H:i') }}</div>
                </div>
            </div>

            <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-lg font-semibold text-gray-900">Traçabilité livreur</h3>
                @if(!$order->driver)
                    <div class="text-sm text-gray-500">Aucun livreur n’a encore accepté cette commande.</div>
                @else
                    <div class="space-y-2 text-sm text-gray-700">
                        <div><span class="font-semibold">Driver ID:</span> {{ $order->driver_id }}</div>
                        <div><span class="font-semibold">Dernière position:</span>
                            @if($order->driver_latitude && $order->driver_longitude)
                                {{ $order->driver_latitude }}, {{ $order->driver_longitude }}
                                <a class="ml-2 text-orange-700 hover:underline"
                                   href="https://www.google.com/maps?q={{ $order->driver_latitude }},{{ $order->driver_longitude }}"
                                   target="_blank" rel="noopener">Voir sur Maps</a>
                            @else
                                <span class="text-gray-400">pas encore envoyée</span>
                            @endif
                        </div>
                        <div><span class="font-semibold">Dernière mise à jour:</span>
                            {{ $order->last_location_update?->format('d/m/Y H:i:s') ?? '-' }}
                        </div>
                    </div>
                @endif
            </div>

            <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-lg font-semibold text-gray-900">Timeline</h3>
                @php
                    $steps = [
                        ['key' => 'accepted_at', 'label' => 'Acceptée (livreur)'],
                        ['key' => 'preparing_at', 'label' => 'Préparation'],
                        ['key' => 'picked_up_at', 'label' => 'Récupérée'],
                        ['key' => 'delivering_at', 'label' => 'En livraison'],
                        ['key' => 'delivered_at', 'label' => 'Livrée'],
                        ['key' => 'cancelled_at', 'label' => 'Annulée'],
                    ];
                @endphp
                <div class="space-y-2 text-sm">
                    @foreach($steps as $s)
                        @php($val = data_get($order, $s['key']))
                        <div class="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2">
                            <div class="font-medium text-gray-900">{{ $s['label'] }}</div>
                            <div class="text-gray-600">
                                {{ $val ? $val->format('d/m/Y H:i:s') : '-' }}
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            @include('admin.partials.order-payment', [
                'order' => $order,
                'printRoute' => route('restaurant.orders.invoice', $order->id),
            ])

            <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-lg font-semibold text-gray-900">Montants</h3>
                <div class="space-y-2 text-sm text-gray-700">
                    <div class="flex justify-between"><span>Sous-total</span><span>{{ number_format((int) $order->subtotal, 0, '.', ' ') }} FC</span></div>
                    <div class="flex justify-between"><span>Livraison</span><span>{{ number_format((int) $order->delivery_fee, 0, '.', ' ') }} FC</span></div>
                    <div class="flex justify-between"><span>Frais service</span><span>{{ number_format((int) $order->service_fee, 0, '.', ' ') }} FC</span></div>
                    <div class="flex justify-between"><span>Remise</span><span>-{{ number_format((int) $order->discount_amount, 0, '.', ' ') }} FC</span></div>
                    <div class="flex justify-between"><span>Pourboire</span><span>{{ number_format((int) $order->tip, 0, '.', ' ') }} FC</span></div>
                    <div class="mt-3 flex justify-between border-t pt-3 text-base font-bold text-gray-900"><span>Total</span><span>{{ number_format((int) $order->total, 0, '.', ' ') }} FC</span></div>
                </div>
            </div>
        </div>
    </div>
@endsection

