<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller as BaseController;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class StatsController extends BaseController
{
    // Stats for admin dashboard
    public function adminStats()
    {
        // Orders per day (last 7 days)
        $ordersPerDay = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Revenue per month (last 6 months)
        $revenuePerMonth = Order::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('SUM(total) as total')
        )
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Order status distribution
        $statusDistribution = Order::select(
            'status',
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('status')
            ->get();

        return response()->json([
            'orders_per_day' => $ordersPerDay,
            'revenue_per_month' => $revenuePerMonth,
            'status_distribution' => $statusDistribution,
        ]);
    }

    // Stats for restaurant dashboard
    public function restaurantStats()
    {
        $user = auth()->user();
        $restaurant = \App\Models\Restaurant::where('user_id', $user->id)->first();

        if (!$restaurant) {
            return response()->json(['error' => 'No restaurant found'], 404);
        }

        // Orders per day (last 7 days)
        $ordersPerDay = Order::where('restaurant_id', $restaurant->id)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Revenue per month (last 6 months)
        $revenuePerMonth = Order::where('restaurant_id', $restaurant->id)
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(total) as total')
            )
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'orders_per_day' => $ordersPerDay,
            'revenue_per_month' => $revenuePerMonth,
        ]);
    }
}
