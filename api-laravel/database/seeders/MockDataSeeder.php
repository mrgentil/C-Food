<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\MenuItem;
use App\Models\Category;
use App\Models\User;
use App\Models\Address;

class MockDataSeeder extends Seeder
{
    public function run()
    {
        // Create a default user and address
        $user = User::firstOrCreate(
            ['email' => 'test@doordash.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'phone' => '+243123456789',
            ]
        );

        Address::firstOrCreate(
            ['user_id' => $user->id, 'label' => 'Domicile'],
            [
                'street' => '123 Avenue de la Paix',
                'city' => 'Kinshasa',
                'neighborhood' => 'Gombe',
                'latitude' => -4.3250,
                'longitude' => 15.3135,
                'is_default' => true,
            ]
        );

        // Create categories
        $categories = [
            ['id' => 1, 'name' => 'Fast Food', 'icon' => 'fast-food-outline', 'color' => '#FF6B00'],
            ['id' => 2, 'name' => 'Asiatique', 'icon' => 'restaurant', 'color' => '#FF0000'],
            ['id' => 3, 'name' => 'Pizza', 'icon' => 'pizza', 'color' => '#FFB800'],
            ['id' => 4, 'name' => 'Burger', 'icon' => 'fast-food-outline', 'color' => '#8B4513'],
            ['id' => 5, 'name' => 'Healthy', 'icon' => 'leaf-outline', 'color' => '#00A650'],
            ['id' => 6, 'name' => 'Desserts', 'icon' => 'ice-cream-outline', 'color' => '#FF69B4'],
            ['id' => 7, 'name' => 'Boissons', 'icon' => 'cafe-outline', 'color' => '#4169E1'],
            ['id' => 8, 'name' => 'Local', 'icon' => 'flame-outline', 'color' => '#9C27B0'],
            ['id' => 9, 'name' => 'Poulet', 'icon' => 'bonfire-outline', 'color' => '#E65100'],
            ['id' => 10, 'name' => 'Poisson', 'icon' => 'fish-outline', 'color' => '#00BCD4'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['id' => $cat['id']], array_merge($cat, [
                'show_on_home' => true,
                'store_type' => 'restaurant',
            ]));
        }

        // Create restaurants
        $restaurants = [
            [
                'id' => 'r1', 'name' => 'Chez Mama K', 'image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
                'rating' => 4.8, 'review_count' => 342, 'delivery_time' => '25-35 min', 'delivery_fee' => 1500,
                'distance' => 1.2, 'is_promoted' => true, 'discount' => '-20%', 'min_order' => 5000, 'is_open' => true, 'is_featured' => true,
                'latitude' => -4.3250, 'longitude' => 15.3135
            ],
            [
                'id' => 'r2', 'name' => 'Pizza Palace Kin', 'image' => 'https://images.unsplash.com/photo-1604382355076-af83f3e6e05a?w=800',
                'rating' => 4.6, 'review_count' => 218, 'delivery_time' => '30-40 min', 'delivery_fee' => 2000,
                'distance' => 2.5, 'is_new' => true, 'min_order' => 8000, 'is_open' => true, 'is_featured' => true,
                'latitude' => -4.3310, 'longitude' => 15.3200
            ],
            [
                'id' => 'r4', 'name' => 'Burger House Goma', 'image' => 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
                'rating' => 4.5, 'review_count' => 289, 'delivery_time' => '20-30 min', 'delivery_fee' => 1000,
                'distance' => 0.8, 'is_promoted' => true, 'min_order' => 4000, 'is_open' => true, 'is_featured' => true,
                'latitude' => -4.3200, 'longitude' => 15.3100
            ],
            [
                'id' => 'r5', 'name' => 'Green Bowl', 'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
                'rating' => 4.7, 'review_count' => 167, 'delivery_time' => '25-35 min', 'delivery_fee' => 1500,
                'distance' => 1.8, 'min_order' => 6000, 'is_open' => true,
                'latitude' => -4.3280, 'longitude' => 15.3150
            ],
            [
                'id' => 'r6', 'name' => 'Pâtisserie Douceur', 'image' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
                'rating' => 4.9, 'review_count' => 198, 'delivery_time' => '30-40 min', 'delivery_fee' => 1200,
                'distance' => 2.2, 'is_new' => true, 'min_order' => 3000, 'is_open' => true,
                'latitude' => -4.3260, 'longitude' => 15.3120
            ],
        ];

        foreach ($restaurants as $rest) {
            Restaurant::updateOrCreate(['id' => $rest['id']], $rest);
        }

        // Attach categories to restaurants
        $restaurantCategories = [
            'r1' => [8, 9, 1],  // Local, Poulet, Fast Food
            'r2' => [3, 1],      // Pizza, Fast Food
            'r4' => [4, 1],      // Burger, Fast Food
            'r5' => [5, 7],      // Healthy, Boissons
            'r6' => [6],          // Desserts
        ];

        foreach ($restaurantCategories as $restId => $catIds) {
            $restaurant = Restaurant::find($restId);
            if ($restaurant) {
                $restaurant->categories()->attach($catIds);
            }
        }

        // Create menu items
        $menuItems = [
            // r1 - Chez Mama K
            ['id' => 'm1', 'restaurant_id' => 'r1', 'name' => 'Poulet Moambe', 'description' => 'Poulet sauce moambe avec riz et fufu', 'price' => 8500, 'category' => 'Plats principaux', 'image' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', 'is_popular' => true],
            ['id' => 'm2', 'restaurant_id' => 'r1', 'name' => 'Fumbwa', 'description' => 'Feuilles de fumbwa avec poisson fumé', 'price' => 6000, 'category' => 'Plats principaux', 'image' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'],
            ['id' => 'm3', 'restaurant_id' => 'r1', 'name' => 'Brochettes de Poulet', 'description' => '3 brochettes avec frites et salade', 'price' => 5500, 'category' => 'Grillades', 'image' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 'is_popular' => true],
            ['id' => 'm4', 'restaurant_id' => 'r1', 'name' => 'Fufu + Sauce Arachide', 'description' => 'Fufu maison avec sauce arachide et viande', 'price' => 4500, 'category' => 'Plats principaux'],
            ['id' => 'm5', 'restaurant_id' => 'r1', 'name' => 'Poulet Braisé', 'description' => 'Demi poulet braisé avec frites', 'price' => 9000, 'category' => 'Grillades', 'is_popular' => true],
            // r2 - Pizza Palace
            ['id' => 'm6', 'restaurant_id' => 'r2', 'name' => 'Pizza Margherita', 'description' => 'Tomate, mozzarella, basilic frais', 'price' => 12000, 'category' => 'Pizzas', 'image' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', 'is_popular' => true],
            ['id' => 'm7', 'restaurant_id' => 'r2', 'name' => 'Pizza Pepperoni', 'description' => 'Pepperoni, mozzarella, sauce tomate', 'price' => 14000, 'category' => 'Pizzas', 'image' => 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'],
            ['id' => 'm8', 'restaurant_id' => 'r2', 'name' => 'Pizza 4 Fromages', 'description' => 'Mozzarella, gorgonzola, parmesan, chèvre', 'price' => 16000, 'category' => 'Pizzas'],
            ['id' => 'm9', 'restaurant_id' => 'r2', 'name' => 'Calzone', 'description' => 'Pizza pliée jambon champignon', 'price' => 13000, 'category' => 'Pizzas'],
            // r4 - Burger House
            ['id' => 'm10', 'restaurant_id' => 'r4', 'name' => 'Classic Burger', 'description' => 'Steak haché, cheddar, salade, tomate, oignons', 'price' => 7000, 'category' => 'Burgers', 'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'is_popular' => true],
            ['id' => 'm11', 'restaurant_id' => 'r4', 'name' => 'Double Cheese Burger', 'description' => 'Double steak, double cheddar, bacon', 'price' => 10000, 'category' => 'Burgers', 'image' => 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400'],
            ['id' => 'm12', 'restaurant_id' => 'r4', 'name' => 'Chicken Burger', 'description' => 'Poulet croustillant, mayo, salade', 'price' => 8000, 'category' => 'Burgers'],
            ['id' => 'm13', 'restaurant_id' => 'r4', 'name' => 'Frites Maison', 'description' => 'Portion de frites croustillantes', 'price' => 2500, 'category' => 'Accompagnements'],
            // r5 - Green Bowl
            ['id' => 'm14', 'restaurant_id' => 'r5', 'name' => 'Salade César', 'description' => 'Poulet grillé, parmesan, croutons, sauce César', 'price' => 7500, 'category' => 'Salades', 'image' => 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'is_popular' => true],
            ['id' => 'm15', 'restaurant_id' => 'r5', 'name' => 'Bowl Avocat Saumon', 'description' => 'Saumon frais, avocat, riz, edamame', 'price' => 12000, 'category' => 'Bowls', 'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'],
            ['id' => 'm16', 'restaurant_id' => 'r5', 'name' => 'Smoothie Vert', 'description' => 'Épinard, banane, mangue, gingembre', 'price' => 3500, 'category' => 'Boissons'],
            // r6 - Pâtisserie
            ['id' => 'm17', 'restaurant_id' => 'r6', 'name' => 'Gâteau au Chocolat', 'description' => 'Fondant au chocolat noir', 'price' => 4000, 'category' => 'Gâteaux', 'image' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 'is_popular' => true],
            ['id' => 'm18', 'restaurant_id' => 'r6', 'name' => 'Croissant Beurre', 'description' => 'Croissant feuilleté au beurre', 'price' => 2000, 'category' => 'Viennoiseries'],
            ['id' => 'm19', 'restaurant_id' => 'r6', 'name' => 'Tiramisu', 'description' => 'Tiramisu traditionnel italien', 'price' => 5000, 'category' => 'Gâteaux'],
            ['id' => 'm20', 'restaurant_id' => 'r6', 'name' => 'Milkshake', 'description' => 'Vanille, fraise ou chocolat', 'price' => 3500, 'category' => 'Boissons'],
        ];

        foreach ($menuItems as $item) {
            MenuItem::updateOrCreate(['id' => $item['id']], $item);
        }
    }
}
