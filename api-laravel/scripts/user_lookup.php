<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = $argv[1] ?? '';
if (!$email) {
    fwrite(STDERR, "Usage: php scripts/user_lookup.php <email>\n");
    exit(2);
}

$u = App\Models\User::where('email', $email)->first();
if (!$u) {
    echo "NOT_FOUND\n";
    exit(0);
}

echo json_encode([
    'email' => $u->email,
    'is_admin' => (bool) $u->is_admin,
    'is_restaurant' => (bool) $u->is_restaurant,
    'is_merchant' => (bool) $u->is_merchant,
    'is_driver' => (bool) $u->is_driver,
    'dash_pass' => (bool) $u->dash_pass,
    'dash_pass_expires_at' => $u->dash_pass_expires_at?->toIso8601String(),
    'suspended_at' => $u->suspended_at?->toIso8601String(),
], JSON_PRETTY_PRINT) . "\n";

