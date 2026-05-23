<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShopType;

class ShopTypeSeeder extends Seeder
{
    public function run(): void
    {
        ShopType::truncate();

        $types = [
            // === Shop Types (catégories de boutiques) ===
            ['name' => 'Pharmacie', 'category' => 'shop_type', 'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ad?w=400', 'order_index' => 1],
            ['name' => 'Épicerie', 'category' => 'shop_type', 'image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 'order_index' => 2],
            ['name' => 'Fruits', 'category' => 'shop_type', 'image' => 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400', 'order_index' => 3],
            ['name' => 'Magasin', 'category' => 'shop_type', 'image' => 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400', 'order_index' => 4],
            ['name' => 'Restaurant', 'category' => 'shop_type', 'image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', 'order_index' => 5],
            ['name' => 'Quincaillerie', 'category' => 'shop_type', 'image' => 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400', 'order_index' => 6],
            ['name' => 'Montres', 'category' => 'shop_type', 'image' => 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', 'order_index' => 7],
            ['name' => 'Animalerie', 'category' => 'shop_type', 'image' => 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400', 'order_index' => 8],

            // === Trouvailles fraîches (Fresh Finds Await) ===
            ['name' => 'Alcool', 'category' => 'fresh_finds', 'image' => 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400', 'order_index' => 1],
            ['name' => 'Fleurs', 'category' => 'fresh_finds', 'image' => 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400', 'order_index' => 2],
            ['name' => 'Poisson & Viande', 'category' => 'fresh_finds', 'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 'order_index' => 3],
            ['name' => 'Boulangerie', 'category' => 'fresh_finds', 'image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'order_index' => 4],
            ['name' => 'Légumes Bio', 'category' => 'fresh_finds', 'image' => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', 'order_index' => 5],
            ['name' => 'Produits laitiers', 'category' => 'fresh_finds', 'image' => 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400', 'order_index' => 6],

            // === Top épicerie (Top Grocery Picks) ===
            ['name' => 'Boissons', 'category' => 'grocery_picks', 'image' => 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400', 'order_index' => 1],
            ['name' => 'Snacks', 'category' => 'grocery_picks', 'image' => 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', 'order_index' => 2],
            ['name' => 'Riz & Céréales', 'category' => 'grocery_picks', 'image' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', 'order_index' => 3],
            ['name' => 'Conserves', 'category' => 'grocery_picks', 'image' => 'https://images.unsplash.com/photo-1534483509719-8234e5fa2095?w=400', 'order_index' => 4],
            ['name' => 'Surgelés', 'category' => 'grocery_picks', 'image' => 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400', 'order_index' => 5],
            ['name' => 'Hygiène', 'category' => 'grocery_picks', 'image' => 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', 'order_index' => 6],
        ];

        foreach ($types as $type) {
            ShopType::create($type);
        }
    }
}
