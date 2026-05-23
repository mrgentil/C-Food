<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Set test user as admin
        $admin = User::where('email', 'test@doordash.com')->first();
        if ($admin) {
            $admin->update(['is_admin' => true]);
        }

        // Create restaurant user
        User::updateOrCreate(
            ['email' => 'restaurant@doordash.com'],
            [
                'name' => 'Restaurant Owner',
                'password' => bcrypt('password'),
                'phone' => '+243987654321',
                'is_restaurant' => true,
            ]
        );
    }
}
