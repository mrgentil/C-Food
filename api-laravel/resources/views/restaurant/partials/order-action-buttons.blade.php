{{-- Boutons commande (liste, dashboard) : $order --}}
<div class="flex flex-wrap gap-2">
    <a href="{{ route('restaurant.orders.show', $order->id) }}"
       class="px-3 py-1 border border-gray-200 bg-white text-gray-700 text-xs rounded hover:bg-gray-50 transition">
        Détails
    </a>
    <a href="{{ route('order.track', $order->id) }}" target="_blank" rel="noopener"
       class="px-3 py-1 border border-orange-200 bg-orange-50 text-orange-800 text-xs rounded hover:bg-orange-100 transition">
        Suivi
    </a>
    @if($order->status == 'pending')
        <form method="POST" action="{{ route('restaurant.orders.validate', $order->id) }}" class="inline">
            @csrf
            <button type="submit" class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition">
                Accepter
            </button>
        </form>
        <form method="POST" action="{{ route('restaurant.orders.reject', $order->id) }}" class="inline" onsubmit="return confirm('Annuler cette commande ? Le client sera notifié.')">
            @csrf
            <button type="submit" class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition">
                Annuler
            </button>
        </form>
    @endif

    @if($order->status == 'preparing')
        <form method="POST" action="{{ route('restaurant.orders.status', $order->id) }}" class="inline">
            @csrf
            <input type="hidden" name="status" value="picked_up">
            <button type="submit" class="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition">
                Marquer récupérée
            </button>
        </form>
        <form method="POST" action="{{ route('restaurant.orders.status', $order->id) }}" class="inline" onsubmit="return confirm('Annuler la commande en cours de préparation ?')">
            @csrf
            <input type="hidden" name="status" value="cancelled">
            <button type="submit" class="px-3 py-1 border border-red-200 bg-white text-red-700 text-xs rounded hover:bg-red-50 transition">
                Annuler
            </button>
        </form>
    @endif

    @if($order->status == 'picked_up')
        <form method="POST" action="{{ route('restaurant.orders.status', $order->id) }}" class="inline">
            @csrf
            <input type="hidden" name="status" value="delivering">
            <button type="submit" class="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition">
                En livraison
            </button>
        </form>
        <form method="POST" action="{{ route('restaurant.orders.status', $order->id) }}" class="inline" onsubmit="return confirm('Annuler alors que la commande est marquée récupérée ?')">
            @csrf
            <input type="hidden" name="status" value="cancelled">
            <button type="submit" class="px-3 py-1 border border-red-200 bg-white text-red-700 text-xs rounded hover:bg-red-50 transition">
                Annuler
            </button>
        </form>
    @endif

    @if($order->status == 'delivering')
        <form method="POST" action="{{ route('restaurant.orders.status', $order->id) }}" class="inline">
            @csrf
            <input type="hidden" name="status" value="delivered">
            <button type="submit" class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition">
                Marquer livrée
            </button>
        </form>
        <form method="POST" action="{{ route('restaurant.orders.status', $order->id) }}" class="inline" onsubmit="return confirm('Annuler alors que la livraison est en cours ?')">
            @csrf
            <input type="hidden" name="status" value="cancelled">
            <button type="submit" class="px-3 py-1 border border-red-200 bg-white text-red-700 text-xs rounded hover:bg-red-50 transition">
                Annuler
            </button>
        </form>
    @endif
</div>
