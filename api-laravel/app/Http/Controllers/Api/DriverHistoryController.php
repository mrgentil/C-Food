<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\DriverCommission;
use App\Support\OrderPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DriverHistoryController extends Controller
{
    private function periodStart(string $period): ?Carbon
    {
        return match ($period) {
            'today' => now()->startOfDay(),
            'week' => now()->startOfWeek(Carbon::MONDAY),
            'month' => now()->startOfMonth(),
            default => null,
        };
    }

    private function baseDriverQuery(int $driverId, string $period)
    {
        $q = Order::query()->where('driver_id', $driverId);

        $from = $this->periodStart($period);
        if ($from) {
            $q->whereRaw(
                'COALESCE(delivered_at, cancelled_at, updated_at) >= ?',
                [$from]
            );
        }

        return $q;
    }

    public function index(Request $request)
    {
        $driver = $request->user();

        $validated = $request->validate([
            'filter' => 'nullable|in:all,delivered,cancelled',
            'period' => 'nullable|in:all,today,week,month',
        ]);

        $filter = $validated['filter'] ?? 'all';
        $period = $validated['period'] ?? 'all';

        $base = $this->baseDriverQuery($driver->id, $period);

        $deliveredCount = (int) (clone $base)->where('status', 'delivered')->count();
        $cancelledCount = (int) (clone $base)->where('status', 'cancelled')->count();

        $commissionInPeriod = DriverCommission::forOrderTotal(
            (int) (clone $base)->where('status', 'delivered')->sum('total')
        );

        $q = (clone $base)
            ->with(['restaurant', 'address', 'user'])
            ->orderByDesc('updated_at');

        if ($filter === 'delivered') {
            $q->where('status', 'delivered');
        } elseif ($filter === 'cancelled') {
            $q->where('status', 'cancelled');
        } else {
            $q->whereIn('status', ['delivered', 'cancelled']);
        }

        $orders = $q->limit(100)->get();

        return response()->json([
            'meta' => [
                'filter' => $filter,
                'period' => $period,
                'delivered_count' => $deliveredCount,
                'cancelled_count' => $cancelledCount,
                'total_count' => $deliveredCount + $cancelledCount,
                'commission_in_period' => $commissionInPeriod,
            ],
            'data' => $orders->map(function (Order $o) {
                $total = (int) ($o->total ?? 0);

                return [
                    'id' => $o->id,
                    'status' => $o->status,
                    'subtotal' => (int) ($o->subtotal ?? 0),
                    'service_fee' => (int) ($o->service_fee ?? 0),
                    'discount_amount' => (int) ($o->discount_amount ?? 0),
                    'tip' => (int) ($o->tip ?? 0),
                    'total' => $total,
                    'commission' => DriverCommission::forOrderTotal($total),
                    'payment_summary' => OrderPayment::summary($o),
                    'delivery_fee' => $o->delivery_fee,
                    'delivery_photo_url' => $o->delivery_photo_url,
                    'updated_at' => optional($o->updated_at)?->toIso8601String(),
                    'created_at' => optional($o->created_at)?->toIso8601String(),
                    'delivered_at' => optional($o->delivered_at)?->toIso8601String(),
                    'cancelled_at' => optional($o->cancelled_at)?->toIso8601String(),
                    'accepted_at' => optional($o->accepted_at)?->toIso8601String(),

                    'restaurant' => $o->restaurant ? [
                        'id' => $o->restaurant->id,
                        'name' => $o->restaurant->name,
                        'address' => $o->restaurant->address,
                    ] : null,

                    'customer' => $o->user ? [
                        'id' => $o->user->id,
                        'name' => $o->user->name,
                        'phone' => $o->user->phone,
                    ] : null,

                    'delivery_address' => $o->address ? [
                        'street' => $o->address->street,
                        'city' => $o->address->city,
                        'neighborhood' => $o->address->neighborhood,
                    ] : null,
                ];
            }),
        ]);
    }
}
