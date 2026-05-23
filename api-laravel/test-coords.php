<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$order = App\Models\Order::find('0b5d3357-4a6e-46a7-800a-b779590f749e');
$r = $order->restaurant;
echo "Lat: " . $r->latitude . " | Lng: " . $r->longitude . "\n";
