<?php

namespace App\Support;

use App\Models\Order;

class DriverCommission
{
    public const RATE = 0.10;

    public static function forOrderTotal(int $total): int
    {
        return (int) round($total * self::RATE);
    }

    public static function forOrder(Order $order): int
    {
        return self::forOrderTotal((int) ($order->total ?? 0));
    }
}
