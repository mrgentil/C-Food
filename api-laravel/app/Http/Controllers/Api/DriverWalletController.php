<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\DriverCommission;
use Illuminate\Http\Request;

class DriverWalletController extends Controller
{
    public function summary(Request $request)
    {
        $driver = $request->user();

        $deliveredQuery = Order::query()
            ->where('driver_id', $driver->id)
            ->where('status', 'delivered');

        $balance = DriverCommission::forOrderTotal((int) $deliveredQuery->sum('total'));

        $recent = (clone $deliveredQuery)
            ->orderByDesc('delivered_at')
            ->orderByDesc('updated_at')
            ->limit(30)
            ->get(['id', 'total', 'delivered_at', 'updated_at']);

        $transactions = $recent->map(function (Order $o) {
            $amount = DriverCommission::forOrder($o);

            return [
                'id' => (string) $o->id,
                'type' => 'earning',
                'amount' => $amount,
                'date' => optional($o->delivered_at ?? $o->updated_at)?->toIso8601String(),
                'reference' => 'Course #'.strtoupper(substr((string) $o->id, 0, 8)),
            ];
        })->values();

        $startOfDay = now()->startOfDay();
        $todayOrders = (clone $deliveredQuery)
            ->where(function ($q) use ($startOfDay) {
                $q->where('delivered_at', '>=', $startOfDay)
                    ->orWhere(function ($q2) use ($startOfDay) {
                        $q2->whereNull('delivered_at')
                            ->where('updated_at', '>=', $startOfDay);
                    });
            })
            ->get(['total']);

        $todayTotal = $todayOrders->sum(fn (Order $o) => DriverCommission::forOrder($o));
        $todayCount = $todayOrders->count();

        return response()->json([
            'data' => [
                'balance' => $balance,
                'today_total' => (int) $todayTotal,
                'today_count' => $todayCount,
                'delivered_count' => (int) (clone $deliveredQuery)->count(),
                'commission_rate' => DriverCommission::RATE,
                'transactions' => $transactions,
            ],
        ]);
    }
}
