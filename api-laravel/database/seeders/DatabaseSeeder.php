<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AppTabSeeder::class,
            CfoodDemoSeeder::class,
            SupermarketSeeder::class,
        ]);
    }
}
