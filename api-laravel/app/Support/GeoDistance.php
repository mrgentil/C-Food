<?php

namespace App\Support;

class GeoDistance
{
    public static function km(?float $lat1, ?float $lon1, ?float $lat2, ?float $lon2): ?float
    {
        if ($lat1 === null || $lon1 === null || $lat2 === null || $lon2 === null) {
            return null;
        }

        $earthRadiusKm = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadiusKm * $c;
    }

    /**
     * SQL expression (km) between driver coords and restaurant columns latitude/longitude.
     */
    public static function haversineSql(string $latColumn, string $lngColumn): string
    {
        return "(6371 * acos(LEAST(1, GREATEST(-1,
            cos(radians(?)) * cos(radians({$latColumn})) * cos(radians({$lngColumn}) - radians(?))
            + sin(radians(?)) * sin(radians({$latColumn}))
        ))))";
    }
}
