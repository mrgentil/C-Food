<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller as BaseController;
use App\Support\OrderTrackingPresenter;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderReview;
use App\Models\PromoCode;
use App\Events\OrderAvailable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends BaseController
{
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = Order::where('user_id', $user->id)
            ->with(['items.menuItem', 'restaurant'])
            ->withExists('review')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $orders]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|string|exists:restaurants,id',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|string|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.selected_options' => 'nullable|array',
            'items.*.special_instructions' => 'nullable|string|max:500',
            'address_id' => 'required|integer|exists:addresses,id',
            'order_type' => 'nullable|in:delivery,pickup',
            'payment_method' => 'required|in:cash,mpesa,airtel_money,orange_money',
            'tip' => 'nullable|integer|min:0',
            'promo_code' => 'nullable|string',
            'delivery_instructions' => 'nullable|string|max:2000',
        ]);

        $user = $request->user();

        DB::beginTransaction();
        try {
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                $subtotal += $menuItem->price * $item['quantity'];
            }

            $orderType = $validated['order_type'] ?? 'delivery';

            $expires = $user->dash_pass_expires_at;
            $hasPass = (bool) $user->dash_pass && (!$expires || now()->lt($expires));

            $deliveryFee = $orderType === 'pickup' ? 0 : 1500;
            if ($orderType === 'delivery' && $hasPass) {
                $deliveryFee = 0;
            }
            $serviceFee = round($subtotal * 0.05);
            $tip = $validated['tip'] ?? 0;

            $discountAmount = 0;
            $promo = null;
            if (!empty($validated['promo_code'])) {
                $promo = PromoCode::where('code', strtoupper(trim($validated['promo_code'])))->first();
                $matchesRestaurant = $promo && (empty($promo->restaurant_id) || (string) $promo->restaurant_id === (string) $validated['restaurant_id']);
                if ($matchesRestaurant && $promo->isCurrentlyValid((int) $subtotal)) {
                    $discountAmount = $promo->computeDiscount((int) $subtotal);
                } else {
                    $promo = null;
                }
            }

            $total = $subtotal + $deliveryFee + $serviceFee + $tip - $discountAmount;
            if ($total < 0) $total = 0;

            $orderNotes = $validated['delivery_instructions'] ?? null;
            if (is_string($orderNotes)) {
                $orderNotes = trim($orderNotes);
                $orderNotes = $orderNotes === '' ? null : $orderNotes;
            } else {
                $orderNotes = null;
            }

            $order = Order::create([
                'user_id' => $user->id,
                'restaurant_id' => $validated['restaurant_id'],
                'address_id' => $validated['address_id'],
                'order_type' => $orderType,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'service_fee' => $serviceFee,
                'discount_amount' => $discountAmount,
                'tip' => $tip,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'promo_code' => $validated['promo_code'] ?? null,
                'delivery_instructions' => $orderNotes,
                'status' => 'pending',
            ]);

            if ($promo && $discountAmount > 0) {
                $promo->increment('uses_count');
            }

            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                $lineNote = $item['special_instructions'] ?? null;
                if (is_string($lineNote)) {
                    $lineNote = trim($lineNote);
                    $lineNote = $lineNote === '' ? null : $lineNote;
                }
                OrderItem::create([
                    'id' => (string) Str::uuid(),
                    'order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'selected_options' => $item['selected_options'] ?? null,
                    'special_instructions' => $lineNote,
                ]);
            }

            DB::commit();

            // Broadcast to drivers
            broadcast(new OrderAvailable($order));

            // Notify restaurant (optional)
            // $this->notifyRestaurant($order);

            return response()->json([
                'message' => 'Commande créée avec succès',
                'data' => $order->load(['items.menuItem', 'restaurant', 'address'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Erreur lors de la commande', 'error' => $e->getMessage()], 500);
        }
    }

    public function reorder(Request $request, $id)
    {
        $user = $request->user();

        $previous = Order::where('user_id', $user->id)
            ->with(['items'])
            ->findOrFail($id);

        DB::beginTransaction();
        try {
            $subtotal = 0;
            foreach ($previous->items as $line) {
                $subtotal += ((int) $line->unit_price) * ((int) $line->quantity);
            }

            $deliveryFee = 1500;
            $serviceFee = (int) round($subtotal * 0.05);
            $tip = 0;
            $total = $subtotal + $deliveryFee + $serviceFee + $tip;

            $order = Order::create([
                'user_id' => $user->id,
                'restaurant_id' => $previous->restaurant_id,
                'address_id' => $previous->address_id,
                'order_type' => $previous->order_type ?? 'delivery',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'service_fee' => $serviceFee,
                'tip' => $tip,
                'total' => $total,
                'payment_method' => $previous->payment_method ?? 'cash',
                'promo_code' => $previous->promo_code,
                'delivery_instructions' => $previous->delivery_instructions,
                'status' => 'pending',
            ]);

            foreach ($previous->items as $line) {
                OrderItem::create([
                    'id' => (string) Str::uuid(),
                    'order_id' => $order->id,
                    'menu_item_id' => $line->menu_item_id,
                    'quantity' => $line->quantity,
                    'unit_price' => $line->unit_price,
                    'selected_options' => $line->selected_options,
                    'special_instructions' => $line->special_instructions,
                ]);
            }

            DB::commit();

            // Broadcast to drivers
            broadcast(new OrderAvailable($order));

            return response()->json([
                'message' => 'Commande re-créée',
                'data' => $order->load(['items.menuItem', 'restaurant', 'address']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la recommande', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::where('user_id', $user->id)
            ->with(['items.menuItem', 'restaurant', 'address', 'driver'])
            ->withExists('review')
            ->findOrFail($id);

        return response()->json(['data' => $order]);
    }

    public function track(Request $request, $id)
    {
        $user = $request->user();

        $order = Order::where('user_id', $user->id)
            ->with(['items.menuItem', 'restaurant', 'address', 'driver'])
            ->withExists('review')
            ->findOrFail($id);

        return response()->json([
            'data' => OrderTrackingPresenter::toArray($order),
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::where('user_id', $user->id)
            ->findOrFail($id);

        if (!in_array($order->status, ['pending', 'preparing'])) {
            return response()->json(['message' => 'Cette commande ne peut plus être annulée'], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Commande annulée avec succès']);
    }

    public function rate(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::where('user_id', $user->id)
            ->where('status', 'delivered')
            ->findOrFail($id);

        if (OrderReview::where('order_id', $order->id)->exists()) {
            return response()->json(['message' => 'Cette commande a déjà été évaluée'], 409);
        }

        $payload = $request->all();
        if (! isset($payload['restaurant_rating']) && isset($payload['rating'])) {
            $request->merge(['restaurant_rating' => $payload['rating']]);
        }
        if (empty($payload['feedback'] ?? null) && ! empty($payload['comment'] ?? null)) {
            $request->merge(['feedback' => $payload['comment']]);
        }

        $rules = [
            'restaurant_rating' => 'required|integer|min:1|max:5',
            'driver_rating' => $order->driver_id
                ? 'required|integer|min:1|max:5'
                : 'nullable|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:500',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ];

        $validated = $request->validate($rules);

        $feedback = $validated['feedback'] ?? null;
        if (is_string($feedback)) {
            $feedback = trim($feedback);
            $feedback = $feedback === '' ? null : $feedback;
        }

        $driverRating = $validated['driver_rating'] ?? null;
        if ($order->driver_id === null) {
            $driverRating = null;
        }

        DB::beginTransaction();
        try {
            OrderReview::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'restaurant_id' => $order->restaurant_id,
                'driver_id' => $order->driver_id,
                'restaurant_rating' => (int) $validated['restaurant_rating'],
                'driver_rating' => $driverRating !== null ? (int) $driverRating : null,
                'feedback' => $feedback,
                'tags' => $validated['tags'] ?? null,
            ]);

            OrderReview::refreshRestaurantStats((string) $order->restaurant_id);
            OrderReview::refreshDriverStats($order->driver_id);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            $msg = strtolower($e->getMessage());
            if (
                str_contains($msg, 'duplicate')
                || str_contains($msg, 'unique constraint')
                || str_contains($msg, 'integrity constraint violation')
            ) {
                return response()->json(['message' => 'Cette commande a déjà été évaluée'], 409);
            }

            return response()->json(['message' => 'Erreur lors de l’enregistrement de l’avis', 'error' => $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'Évaluation enregistrée',
            'data' => [
                'restaurant_id' => $order->restaurant_id,
                'restaurant_rating' => (int) $validated['restaurant_rating'],
                'driver_rating' => $driverRating !== null ? (int) $driverRating : null,
            ],
        ]);
    }

    private function getTimeline($order)
    {
        return [
            [
                'status' => 'pending',
                'label' => 'Commande reçue',
                'completed' => true,
                'time' => $order->created_at->format('H:i'),
            ],
            [
                'status' => 'preparing',
                'label' => 'En préparation',
                'completed' => in_array($order->status, ['preparing', 'picked_up', 'delivering', 'delivered']),
                'time' => $order->status == 'preparing' ? now()->format('H:i') : null,
            ],
            [
                'status' => 'picked_up',
                'label' => 'Récupérée',
                'completed' => in_array($order->status, ['picked_up', 'delivering', 'delivered']),
                'time' => $order->status == 'picked_up' ? now()->format('H:i') : null,
            ],
            [
                'status' => 'delivering',
                'label' => 'En livraison',
                'completed' => in_array($order->status, ['delivering', 'delivered']),
                'time' => $order->status == 'delivering' ? now()->format('H:i') : null,
            ],
            [
                'status' => 'delivered',
                'label' => 'Livrée',
                'completed' => $order->status == 'delivered',
                'time' => $order->status == 'delivered' ? now()->format('H:i') : null,
            ],
        ];
    }

    // Web tracking page (public)
    public function webTrack($id)
    {
        $order = Order::with(['restaurant', 'items.menuItem'])->findOrFail($id);

        return view('order-track', compact('order'));
    }
}
