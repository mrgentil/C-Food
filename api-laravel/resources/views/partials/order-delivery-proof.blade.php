@php
    $proofUrl = $order->delivery_photo_url ?? null;
    if ($proofUrl && ! str_starts_with($proofUrl, 'http://') && ! str_starts_with($proofUrl, 'https://')) {
        $proofUrl = url($proofUrl);
    }
@endphp

<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
    <h3 class="mb-4 text-lg font-semibold text-gray-900">Preuve de livraison</h3>

    @if($proofUrl)
        <p class="mb-3 text-sm text-gray-600">
            Photo envoyée par le livreur{{ $order->driver?->name ? ' (' . $order->driver->name . ')' : '' }}
            @if($order->delivered_at)
                — livrée le {{ $order->delivered_at->format('d/m/Y H:i') }}
            @endif
        </p>
        <a href="{{ $proofUrl }}" target="_blank" rel="noopener" class="block overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img src="{{ $proofUrl }}" alt="Preuve de livraison commande {{ $order->id }}"
                 class="max-h-96 w-full object-contain"
                 loading="lazy">
        </a>
        <a href="{{ $proofUrl }}" target="_blank" rel="noopener"
           class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800">
            Ouvrir la photo en plein écran
        </a>
    @else
        <div class="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            @if($order->status === 'delivered')
                Aucune photo n’a été jointe pour cette livraison.
            @elseif(in_array($order->status, ['delivering', 'picked_up', 'preparing'], true) && $order->driver_id)
                En attente : le livreur doit prendre une photo à la remise du colis.
            @else
                Photo disponible après livraison par le livreur.
            @endif
        </div>
    @endif
</div>
