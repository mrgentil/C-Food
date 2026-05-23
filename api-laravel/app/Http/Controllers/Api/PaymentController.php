<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Traitement de paiement - SIMULATION
     * Remplacer par les vraies APIs M-Pesa/Airtel/Orange quand disponibles
     */
    public function process(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'method' => 'required|in:mpesa,airtel_money,orange_money,cash',
            'amount' => 'required|integer|min:0',
            'phone_number' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = Order::find($request->order_id);

        if ($request->method === 'cash') {
            $order->update([
                'status' => 'preparing',
                'payment_method' => 'cash',
                'transaction_id' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Commande enregistrée — paiement en espèces à la livraison',
                'transaction_id' => null,
                'order' => $order->fresh(),
            ]);
        }

        // SIMULATION pour mobile money
        sleep(2); // Simule le délai réseau

        $transactionId = 'TXN' . time() . substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 5);

        // 95% de réussite simulée
        $success = rand(1, 100) <= 95;

        if ($success) {
            $order->update([
                'status' => 'preparing',
                'payment_method' => $request->method,
                'transaction_id' => $transactionId,
                'paid_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Paiement de {$request->amount} FC reçu via " . strtoupper($request->method),
                'transaction_id' => $transactionId,
                'order' => $order->fresh(),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Paiement échoué. Veuillez réessayer.',
            'transaction_id' => '',
        ], 400);
    }
}
