<?php

namespace App\Support;

class AdminDocumentUrl
{
    public static function display(?string $url): ?string
    {
        if ($url === null || trim($url) === '') {
            return null;
        }

        $url = trim($url);

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        if (str_starts_with($url, '/')) {
            return asset($url);
        }

        return asset('/'.ltrim($url, '/'));
    }
}
