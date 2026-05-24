<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Models\Order;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminPayoutController extends Controller
{
    public function index(Request $request)
    {
        $payouts = Payout::with('restaurant')->orderBy('created_at', 'desc')->paginate(15);
        return view('admin.payouts', compact('payouts'));
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'commission_rate' => 'required|numeric|min:0|max:100',
        ]);

        $start = Carbon::parse($validated['period_start'])->startOfDay();
        $end = Carbon::parse($validated['period_end'])->endOfDay();
        $commissionRate = $validated['commission_rate'] / 100;

        $restaurants = Restaurant::all();
        $generatedCount = 0;

        foreach ($restaurants as $restaurant) {
            // Check if a payout already exists for this period
            $exists = Payout::where('restaurant_id', $restaurant->id)
                ->where('period_start', $start)
                ->where('period_end', $end)
                ->exists();

            if ($exists) continue;

            $orders = Order::where('restaurant_id', $restaurant->id)
                ->where('status', 'delivered')
                ->whereBetween('created_at', [$start, $end])
                ->get();

            if ($orders->isEmpty()) continue;

            $totalSales = $orders->sum('total');
            $commissionAmount = $totalSales * $commissionRate;
            $netPayout = $totalSales - $commissionAmount;

            Payout::create([
                'restaurant_id' => $restaurant->id,
                'period_start' => $start,
                'period_end' => $end,
                'total_sales' => $totalSales,
                'commission_amount' => $commissionAmount,
                'net_payout' => $netPayout,
                'status' => 'pending',
            ]);

            $generatedCount++;
        }

        return back()->with('success', "{$generatedCount} paiements générés pour la période sélectionnée.");
    }

    public function markAsPaid(Request $request, Payout $payout)
    {
        $request->validate(['reference_number' => 'nullable|string|max:255']);

        $payout->update([
            'status' => 'paid',
            'paid_at' => now(),
            'reference_number' => $request->reference_number ?? 'MANUAL_PAY_' . uniqid(),
        ]);

        return back()->with('success', "Le paiement pour {$payout->restaurant->name} a été marqué comme réglé.");
    }
}
