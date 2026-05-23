<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    public function quote(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|string|exists:restaurants,id',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|string|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'order_type' => 'nullable|in:delivery,pickup',
            'tip' => 'nullable|integer|min:0',
            'promo_code' => 'nullable|string|max:50',
        ]);

        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $menuItem = MenuItem::find($item['menu_item_id']);
            $subtotal += ((int) $menuItem->price) * ((int) $item['quantity']);
        }

        $orderType = $validated['order_type'] ?? 'delivery';

        $user = $request->user();
        $hasPass = false;
        if ($user) {
            $expires = $user->dash_pass_expires_at;
            $hasPass = (bool) $user->dash_pass && (!$expires || now()->lt($expires));
        }

        $deliveryFee = $orderType === 'pickup' ? 0 : 1500;
        if ($orderType === 'delivery' && $hasPass) {
            $deliveryFee = 0;
        }
        $serviceFee = (int) round($subtotal * 0.05);
        $tip = (int) ($validated['tip'] ?? 0);

        $discountAmount = 0;
        if (!empty($validated['promo_code'])) {
            $promo = PromoCode::where('code', strtoupper(trim($validated['promo_code'])))->first();
            $matchesRestaurant = $promo && (empty($promo->restaurant_id) || (string) $promo->restaurant_id === (string) $validated['restaurant_id']);
            if ($matchesRestaurant && $promo->isCurrentlyValid((int) $subtotal)) {
                $discountAmount = $promo->computeDiscount((int) $subtotal);
            }
        }

        $total = $subtotal + $deliveryFee + $serviceFee + $tip - $discountAmount;
        if ($total < 0) $total = 0;

        return response()->json([
            'data' => [
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'service_fee' => $serviceFee,
                'discount_amount' => $discountAmount,
                'tip' => $tip,
                'total' => $total,
                'currency' => 'CDF',
                'currency_symbol' => 'FC',
            ],
        ]);
    }
}

