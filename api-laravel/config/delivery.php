<?php

return [
    /*
    | Distance (km) from driver to restaurant for available orders in the list.
    */
    'visible_radius_km' => (float) env('DELIVERY_VISIBLE_RADIUS_KM', 8),

    /*
    | Max distance (km) to accept an order (safety net beyond visible list).
    */
    'accept_max_radius_km' => (float) env('DELIVERY_ACCEPT_MAX_RADIUS_KM', 10),
];
