<?php

namespace App\Support;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class AdminHtmx
{
    public static function isPartial(Request $request): bool
    {
        return $request->header('HX-Request') === 'true';
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function list(Request $request, string $pageView, string $partialView, array $data): View
    {
        if (self::isPartial($request)) {
            return view($partialView, $data);
        }

        return view($pageView, $data);
    }
}
