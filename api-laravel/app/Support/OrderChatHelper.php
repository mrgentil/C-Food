<?php

namespace App\Support;

use App\Events\OrderChatMessageSent;
use App\Http\Controllers\Api\NotificationController;
use App\Models\Order;
use App\Models\OrderMessage;
use App\Models\User;

class OrderChatHelper
{
    public static function resolveType(?string $type, ?string $message, ?string $mediaUrl): string
    {
        if ($type && in_array($type, ['text', 'image', 'video', 'audio', 'link'], true)) {
            return $type;
        }

        if ($mediaUrl) {
            $path = strtolower(parse_url($mediaUrl, PHP_URL_PATH) ?? '');

            if (preg_match('/\.(jpe?g|png|gif|webp|bmp)(\?|$)/', $path)) {
                return 'image';
            }
            if (preg_match('/\.(mp4|mov|webm|mkv|m4v)(\?|$)/', $path)) {
                return 'video';
            }
            if (preg_match('/\.(m4a|mp3|aac|wav|ogg|caf)(\?|$)/', $path)) {
                return 'audio';
            }

            return 'link';
        }

        if ($message && preg_match('/^https?:\/\/\S+$/i', trim($message))) {
            return 'link';
        }

        return 'text';
    }

    public static function pushBody(string $type, ?string $message): string
    {
        return match ($type) {
            'image' => '📷 Photo',
            'video' => '🎥 Vidéo',
            'audio' => '🎤 Message vocal',
            'link' => $message ? mb_substr(trim($message), 0, 120) : '🔗 Lien',
            default => $message ? mb_substr(trim($message), 0, 120) : 'Nouveau message',
        };
    }

    public static function create(
        Order $order,
        User $user,
        string $senderRole,
        array $validated
    ): OrderMessage {
        $message = isset($validated['message']) ? trim((string) $validated['message']) : null;
        $message = $message === '' ? null : $message;
        $mediaUrl = $validated['media_url'] ?? null;

        $type = self::resolveType(
            $validated['type'] ?? null,
            $message,
            $mediaUrl
        );

        $msg = OrderMessage::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'sender_role' => $senderRole,
            'type' => $type,
            'message' => $message,
            'media_url' => $mediaUrl,
            'media_meta' => $validated['media_meta'] ?? null,
        ]);

        $msg->load(['user:id,name,photo']);

        dispatch(function () use ($msg) {
            event(new OrderChatMessageSent($msg));
        })->afterResponse();

        self::notifyCounterparty($order, $senderRole, $type, $message);

        return $msg;
    }

    private static function notifyCounterparty(
        Order $order,
        string $senderRole,
        string $type,
        ?string $message
    ): void {
        try {
            $order->loadMissing(['user', 'driver', 'restaurant']);
            $body = self::pushBody($type, $message);
            $restaurantName = $order->restaurant?->name ?? 'Restaurant';

            if ($senderRole === 'driver') {
                $title = $restaurantName.' · Message du livreur';
                NotificationController::sendExpoPush(
                    optional($order->user)->expo_push_token,
                    $title,
                    $body,
                    ['type' => 'order_message', 'order_id' => $order->id, 'sender_role' => 'driver', 'message_type' => $type]
                );
            } else {
                $title = $restaurantName.' · Message du client';
                NotificationController::sendExpoPush(
                    optional($order->driver)->expo_push_token,
                    $title,
                    $body,
                    ['type' => 'order_message', 'order_id' => $order->id, 'sender_role' => 'user', 'message_type' => $type]
                );
            }
        } catch (\Throwable $e) {
            // ignore
        }
    }
}
