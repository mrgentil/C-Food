<?php

namespace Database\Seeders;

use App\Models\AppTab;
use Illuminate\Database\Seeder;

class AppTabSeeder extends Seeder
{
    public function run(): void
    {
        $tabs = [
            ['slug' => 'restaurant', 'name' => 'Restaurants', 'icon' => 'restaurant-outline', 'sort_order' => 0, 'is_home_tab' => true, 'is_published' => true],
            ['slug' => 'grocery', 'name' => 'Épicerie', 'icon' => 'cart-outline', 'sort_order' => 10, 'is_home_tab' => false, 'is_published' => true],
            ['slug' => 'supermarket', 'name' => 'Supermarché', 'icon' => 'storefront-outline', 'sort_order' => 12, 'is_home_tab' => false, 'is_published' => true],
            ['slug' => 'alcohol', 'name' => 'Alcool', 'icon' => 'wine-outline', 'sort_order' => 20, 'is_home_tab' => false, 'is_published' => true],
            ['slug' => 'flowers', 'name' => 'Fleurs', 'icon' => 'flower-outline', 'sort_order' => 30, 'is_home_tab' => false, 'is_published' => true],
            ['slug' => 'pharmacy', 'name' => 'Pharmacie', 'icon' => 'medical-outline', 'sort_order' => 40, 'is_home_tab' => false, 'is_published' => true],
            ['slug' => 'pet', 'name' => 'Animalerie', 'icon' => 'paw-outline', 'sort_order' => 50, 'is_home_tab' => false, 'is_published' => true],
        ];

        foreach ($tabs as $tab) {
            AppTab::updateOrCreate(['slug' => $tab['slug']], $tab);
        }
    }
}
