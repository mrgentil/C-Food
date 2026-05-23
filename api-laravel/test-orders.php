<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\DriverController;

$driver = User::find(91); 
$request = Request::create('/api/driver/orders', 'GET', [
    'mode' => 'all',
    'city' => 'Kinshasa',
    'latitude' => -4.3250,
    'longitude' => 15.3222,
]);
$request->setUserResolver(function () use ($driver) {
    return $driver;
});

$controller = app(DriverController::class);
$response = $controller->orders($request);
$data = json_decode($response->getContent(), true);

echo "Total available orders: " . count($data['data']) . "\n";
foreach ($data['data'] as $order) {
    echo "Order ID: " . $order['id'] . " | Status: " . $order['status'] . " | Restaurant: " . $order['restaurant']['name'] . "\n";
}
