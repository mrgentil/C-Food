<?php

namespace App\Support;

use App\Models\OrderMessage;

class OrderMessagePresenter
{
    public static function toArray(OrderMessage $m): array
    {
        $m->loadMissing(['user:id,name,photo']);

        return [
            'id' => $m->id,
            'order_id' => $m->order_id,
            'type' => $m->type ?? 'text',
            'message' => $m->message,
            'media_url' => $m->media_url,
            'media_meta' => $m->media_meta,
            'sender_role' => $m->sender_role,
            'user' => $m->user ? [
                'id' => $m->user->id,
                'name' => $m->user->name,
                'photo' => $m->user->photo,
            ] : null,
            'created_at' => optional($m->created_at)?->toIso8601String(),
        ];
    }
}
