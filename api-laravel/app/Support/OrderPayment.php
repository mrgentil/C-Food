<?php

namespace App\Support;

use App\Models\Order;
use Carbon\Carbon;

class OrderPayment
{
    public const STATUS_PAID = 'paid';

    public const STATUS_PENDING_CASH = 'pending_cash';

    public const STATUS_UNPAID = 'unpaid';

    public const STATUS_CANCELLED = 'cancelled';

    public static function methodLabel(?string $method): string
    {
        return match ($method) {
            'mpesa' => 'M-Pesa',
            'airtel_money' => 'Airtel Money',
            'orange_money' => 'Orange Money',
            'cash' => 'Espèces (à la livraison)',
            default => $method ? ucfirst(str_replace('_', ' ', $method)) : '—',
        };
    }

    public static function isCash(Order $order): bool
    {
        return ($order->payment_method ?? '') === 'cash';
    }

    public static function status(Order $order): string
    {
        if ($order->status === 'cancelled') {
            return self::STATUS_CANCELLED;
        }

        if (self::isPaid($order)) {
            return self::STATUS_PAID;
        }

        if (self::isCash($order)) {
            return self::STATUS_PENDING_CASH;
        }

        return self::STATUS_UNPAID;
    }

    public static function isCashCollected(Order $order): bool
    {
        return (bool) $order->cash_collected_at;
    }

    public static function requiresCashCollection(Order $order): bool
    {
        if ($order->status === 'cancelled' || ! self::isCash($order)) {
            return false;
        }

        return ! self::isCashCollected($order);
    }

    public static function isPaid(Order $order): bool
    {
        if ($order->status === 'cancelled') {
            return false;
        }

        if ($order->paid_at) {
            return true;
        }

        if (! empty($order->transaction_id)) {
            return true;
        }

        return self::isCash($order) && self::isCashCollected($order);
    }

    public static function statusLabel(Order $order): string
    {
        return match (self::status($order)) {
            self::STATUS_PAID => 'Payé',
            self::STATUS_PENDING_CASH => 'À encaisser à la livraison',
            self::STATUS_CANCELLED => 'Annulé',
            default => 'Paiement en attente',
        };
    }

    public static function resolvePaidAt(Order $order): ?Carbon
    {
        if ($order->paid_at) {
            return $order->paid_at;
        }

        if (! empty($order->transaction_id)) {
            return $order->preparing_at ?? $order->created_at;
        }

        if (self::isCash($order) && self::isCashCollected($order)) {
            return $order->cash_collected_at ?? $order->paid_at;
        }

        return null;
    }

    public static function invoiceNumber(Order $order): string
    {
        $short = strtoupper(substr(str_replace('-', '', (string) $order->id), 0, 8));

        return 'CF-'.$short;
    }

    public static function syncPaidAt(Order $order): void
    {
        if ($order->paid_at || $order->status === 'cancelled') {
            return;
        }

        if (! empty($order->transaction_id)) {
            $order->paid_at = $order->preparing_at ?? now();

            return;
        }

        if (self::isCash($order) && self::isCashCollected($order)) {
            $order->paid_at = $order->cash_collected_at ?? now();
        }
    }

    public static function markCashCollected(Order $order): void
    {
        if (! self::isCash($order) || self::isCashCollected($order)) {
            return;
        }

        $order->cash_collected_at = now();
        self::syncPaidAt($order);
    }

    public static function summary(Order $order): array
    {
        $paidAt = self::resolvePaidAt($order);
        $status = self::status($order);

        $cashCollectedAt = $order->cash_collected_at;

        return [
            'payment_method' => $order->payment_method,
            'payment_method_label' => self::methodLabel($order->payment_method),
            'transaction_id' => $order->transaction_id,
            'payment_status' => $status,
            'payment_status_label' => self::statusLabel($order),
            'is_paid' => self::isPaid($order),
            'paid_at' => $paidAt?->toIso8601String(),
            'paid_at_label' => $paidAt ? $paidAt->format('d/m/Y H:i') : null,
            'invoice_number' => self::invoiceNumber($order),
            'cash_collected' => self::isCashCollected($order),
            'cash_collected_at' => $cashCollectedAt?->toIso8601String(),
            'cash_collected_at_label' => $cashCollectedAt ? $cashCollectedAt->format('d/m/Y H:i') : null,
            'requires_cash_collection' => self::requiresCashCollection($order),
        ];
    }
}
