<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$drivers = User::where('is_driver', 1)->get();
echo "Drivers found:\n";
foreach ($drivers as $d) {
    echo "ID: " . $d->id . " | Name: " . $d->name . " | is_online: " . $d->is_online . " | status: " . $d->driver_verification_status . "\n";
}
