<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        Brand::truncate();

        $brands = [
            // === Nos marques (Our Brands) ===
            ['name' => 'C-Food', 'type' => 'our_brand', 'logo' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200', 'order_index' => 1],
            ['name' => 'C-Food Express', 'type' => 'our_brand', 'logo' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', 'order_index' => 2],
            ['name' => 'C-Food Market', 'type' => 'our_brand', 'logo' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200', 'order_index' => 3],

            // === Top marques restaurants ===
            ['name' => 'KFC', 'type' => 'restaurant', 'logo' => 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/1024px-KFC_logo.svg.png', 'order_index' => 1],
            ['name' => 'McDonald\'s', 'type' => 'restaurant', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1024px-McDonald%27s_Golden_Arches.svg.png', 'order_index' => 2],
            ['name' => 'Burger King', 'type' => 'restaurant', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Burger_King_2020.svg/1024px-Burger_King_2020.svg.png', 'order_index' => 3],
            ['name' => 'Starbucks', 'type' => 'restaurant', 'logo' => 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1024px-Starbucks_Corporation_Logo_2011.svg.png', 'order_index' => 4],
            ['name' => 'Domino\'s', 'type' => 'restaurant', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Domino%27s_pizza_logo.svg/1024px-Domino%27s_pizza_logo.svg.png', 'order_index' => 5],
            ['name' => 'Pizza Hut', 'type' => 'restaurant', 'logo' => 'https://upload.wikimedia.org/wikipedia/sco/thumb/d/d2/Pizza_Hut_logo.svg/1024px-Pizza_Hut_logo.svg.png', 'order_index' => 6],

            // === Marques épicerie (Grocery Brands) ===
            ['name' => 'Shoprite', 'type' => 'grocery', 'logo' => 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200', 'order_index' => 1],
            ['name' => 'Kin Marché', 'type' => 'grocery', 'logo' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200', 'order_index' => 2],
            ['name' => 'Hasson & Frères', 'type' => 'grocery', 'logo' => 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200', 'order_index' => 3],
            ['name' => 'City Market', 'type' => 'grocery', 'logo' => 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200', 'order_index' => 4],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}
