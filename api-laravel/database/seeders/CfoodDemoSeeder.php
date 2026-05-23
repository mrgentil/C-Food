<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\MenuItemCategory;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CfoodDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::beginTransaction();
        try {
            $this->seedUsersAndAddresses();
            $categoriesByType = $this->seedCategories();
            $this->seedMerchantsStoresMenus($categoriesByType);
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function seedUsersAndAddresses(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@c-food.com'],
            [
                'name' => 'Admin C-Food',
                'password' => Hash::make('password123'),
                'phone' => '+243800000001',
                'is_admin' => true,
                'is_merchant' => false,
                'is_restaurant' => false,
                'is_driver' => false,
            ]
        );

        // Clients
        $faker = fake();
        for ($i = 0; $i < 25; $i++) {
            $email = "client{$i}@c-food.com";
            $u = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $faker->name(),
                    'password' => Hash::make('password123'),
                    'phone' => '+243'.(string) $faker->numberBetween(810000000, 899999999),
                    'is_admin' => false,
                    'is_merchant' => false,
                    'is_restaurant' => false,
                    'is_driver' => false,
                ]
            );

            Address::updateOrCreate(
                ['user_id' => $u->id, 'label' => 'Domicile'],
                [
                    'street' => $faker->streetAddress(),
                    'city' => 'Kinshasa',
                    'neighborhood' => $faker->randomElement(['Gombe', 'Lingwala', 'Kintambo', 'Ngaliema', 'Lemba']),
                    'instructions' => $faker->boolean(40) ? $faker->sentence() : null,
                    'latitude' => $faker->randomFloat(7, -4.40, -4.28),
                    'longitude' => $faker->randomFloat(7, 15.25, 15.37),
                    'is_default' => true,
                ]
            );
        }
    }

    /**
     * @return array<string, array<int, int>> category IDs keyed by store type
     */
    private function seedCategories(): array
    {
        $groups = [
            'restaurant' => [
                ['Pizza', 'pizza', '#FFB800'],
                ['Burger', 'fast-food-outline', '#8B4513'],
                ['Local', 'flame-outline', '#9C27B0'],
                ['Poulet', 'bonfire-outline', '#E65100'],
                ['Poisson', 'fish-outline', '#00BCD4'],
                ['Desserts', 'ice-cream-outline', '#FF69B4'],
                ['Boissons', 'cafe-outline', '#4169E1'],
                ['Healthy', 'leaf-outline', '#00A650'],
            ],
            'pharmacy' => [
                // Must match mobile PharmacyScreen SUBCATEGORIES
                ['Médicaments', 'medkit', '#2563EB'],
                ['Soins', 'bandage', '#1D4ED8'],
                ['Bébé', 'happy-outline', '#F59E0B'],
                ['Vitamines', 'leaf-outline', '#16A34A'],
                ['Premiers soins', 'bandage', '#0EA5E9'],
            ],
            'grocery' => [
                // Must match mobile GroceryScreen SUBCATEGORIES
                ['Fruits & Légumes', 'nutrition-outline', '#22C55E'],
                ['Céréales', 'grid-outline', '#F59E0B'],
                ['Boissons', 'cafe-outline', '#4169E1'],
                ['Produits laitiers', 'snow-outline', '#60A5FA'],
                ['Viandes', 'bonfire-outline', '#DC2626'],
                ['Huiles', 'flask-outline', '#92400E'],
                ['Snacks', 'fast-food-outline', '#F97316'],
            ],
            'alcohol' => [
                // Must match mobile AlcoholScreen SUBCATEGORIES
                ['Bières', 'beer-outline', '#F59E0B'],
                ['Vins', 'wine-outline', '#7C3AED'],
                ['Spirits', 'flask-outline', '#92400E'],
                ['Champagne', 'wine-outline', '#FDE68A'],
                ['Cocktails', 'wine-outline', '#DB2777'],
                ['Sans alcool', 'cafe-outline', '#0EA5E9'],
            ],
            'flowers' => [
                // Must match mobile FlowersScreen OCCASIONS
                ['Anniversaire', 'gift-outline', '#F59E0B'],
                ['Mariage', 'rose-outline', '#EC4899'],
                ['Romantique', 'heart-outline', '#F43F5E'],
                ['Deuil', 'flower-outline', '#6B7280'],
                ['Congratulations', 'sparkles-outline', '#0EA5E9'],
            ],
            'pet' => [
                // Must match mobile PetStoreScreen SUBCATEGORIES
                ['Nourriture', 'paw-outline', '#A16207'],
                ['Accessoires', 'bag-handle-outline', '#6B7280'],
                ['Hygiène', 'water-outline', '#2563EB'],
                ['Jouets', 'balloon-outline', '#0EA5E9'],
                ['Vétérinaire', 'medkit', '#16A34A'],
            ],
        ];

        $idsByType = [];
        foreach ($groups as $type => $rows) {
            $idsByType[$type] = [];
            foreach ($rows as [$name, $icon, $color]) {
                $cat = Category::firstOrCreate(
                    ['name' => $name],
                    [
                        'icon' => $icon,
                        'color' => $color,
                        'show_on_home' => $type === 'restaurant',
                        'store_type' => $type,
                    ]
                );
                $cat->update([
                    'show_on_home' => $type === 'restaurant',
                    'store_type' => $type,
                ]);
                $idsByType[$type][] = $cat->id;
            }
        }

        return $idsByType;
    }

    /**
     * @param array<string, array<int, int>> $categoriesByType
     */
    private function seedMerchantsStoresMenus(array $categoriesByType): void
    {
        $faker = fake();

        // Target volumes
        $targets = [
            'restaurant' => 80,
            'pharmacy' => 25,
            'grocery' => 40,
            'alcohol' => 15,
            'flowers' => 12,
            'pet' => 10,
        ];

        $merchantCount = 60;
        $merchants = [];
        for ($i = 1; $i <= $merchantCount; $i++) {
            $u = User::updateOrCreate(
                ['email' => "merchant{$i}@c-food.com"],
                [
                    'name' => $faker->name(),
                    'password' => Hash::make('password123'),
                    'phone' => '+243'.(string) $faker->numberBetween(810000000, 899999999),
                    'is_admin' => false,
                    'is_merchant' => true,
                    'is_restaurant' => false,
                    'is_driver' => false,
                ]
            );
            $merchants[] = $u;
        }

        // Use varied, meaningful images per store type.
        // We use source.unsplash.com with a signature so URLs vary but stay stable per entry.
        $storeImageKeywords = [
            'restaurant' => ['restaurant', 'african food', 'pizza', 'burger', 'grill', 'chicken', 'seafood', 'dessert'],
            'pharmacy' => ['pharmacy', 'medicine', 'healthcare', 'drugstore', 'medical supplies'],
            'grocery' => ['grocery store', 'fresh produce', 'supermarket', 'vegetables', 'fruits'],
            'alcohol' => ['wine bottles', 'beer', 'cocktail', 'bar', 'whisky'],
            'flowers' => ['flower shop', 'bouquet', 'roses', 'plants', 'florist'],
            'pet' => ['pet store', 'dog', 'cat', 'pet food', 'pet accessories'],
        ];

        $namesByType = [
            'restaurant' => ['Chez', 'Resto', 'Kitchen', 'Grill', 'Bistro', 'Food', 'Tasty', 'Maison'],
            'pharmacy' => ['Pharmacie', 'Santé', 'Médic', 'Care', 'Vital', 'Clinique'],
            'grocery' => ['Market', 'Épicerie', 'Fresh', 'Panier', 'Bio', 'Super'],
            'alcohol' => ['Cave', 'Bar', 'Bodega', 'Drink', 'Spirits'],
            'flowers' => ['Fleurs', 'Bouquet', 'Rose', 'Garden', 'Flora'],
            'pet' => ['Pet', 'Paws', 'Animal', 'Croq', 'Zoo'],
        ];

        // Kinshasa-ish center (near user experience)
        $centerLat = -4.3250;
        $centerLng = 15.3135;

        foreach ($targets as $type => $count) {
            for ($i = 0; $i < $count; $i++) {
                $owner = $merchants[($i + crc32($type)) % count($merchants)];

                $base = $faker->randomElement($namesByType[$type]);
                $storeName = $type === 'restaurant'
                    ? "{$base} {$faker->firstName()} {$faker->randomElement(['Kin', 'Gombe', 'Lingwala', 'Ngaliema'])}"
                    : "{$base} {$faker->randomElement(['Kin', 'Gombe', 'Delvaux', 'Victoire', 'Limete'])}";

                $id = (string) Str::uuid();
                $store = Restaurant::updateOrCreate(
                    ['id' => $id],
                    [
                        'name' => $storeName,
                        'type' => $type,
                        'owner_user_id' => $owner->id,
                        'user_id' => $owner->id,
                        'description' => $faker->boolean(70) ? $faker->sentence(10) : null,
                        'address' => $faker->streetAddress().', Kinshasa',
                        'phone' => '+243'.(string) $faker->numberBetween(810000000, 899999999),
                        'image' => $this->unsplashImage(
                            array_merge(
                                [$faker->randomElement($storeImageKeywords[$type] ?? ['store'])],
                                $type === 'restaurant' ? [$faker->randomElement(['pizza', 'burger', 'grill', 'pasta', 'sushi'])] : []
                            ),
                            "{$type}-store-{$i}"
                        ),
                        'rating' => $faker->randomFloat(1, 3.8, 4.9),
                        'review_count' => $faker->numberBetween(10, 700),
                        'delivery_time' => $faker->randomElement(['20-30 min', '25-35 min', '30-40 min', '35-50 min']),
                        'delivery_fee' => $faker->numberBetween(0, 2500),
                        'distance' => $faker->randomFloat(1, 0.5, 6.0),
                        'min_order' => $faker->randomElement([0, 3000, 5000, 8000, 10000]),
                        'is_open' => $faker->boolean(85),
                        'is_featured' => $faker->boolean(20),
                        'is_new' => $faker->boolean(20),
                        'is_promoted' => $faker->boolean(10),
                        'discount' => $faker->boolean(25) ? ('-'.$faker->randomElement([10, 15, 20, 25]).'%') : null,
                        // cluster around center so "près de chez toi" looks real
                        'latitude' => $centerLat + $faker->randomFloat(7, -0.03, 0.03),
                        'longitude' => $centerLng + $faker->randomFloat(7, -0.03, 0.03),
                    ]
                );

                // Attach 3-5 global categories, biased by store type
                $pool = $categoriesByType[$type] ?? $categoriesByType['restaurant'];
                $catIds = collect($pool)->shuffle()->take($faker->numberBetween(3, min(5, count($pool))))->values()->all();
                $store->categories()->syncWithoutDetaching($catIds);

                // Menu categories per store
                $menuCategoryNames = $this->menuCategoryNamesForType($type);
                $menuCategoryIds = [];
                $sort = 0;
                foreach ($menuCategoryNames as $mcName) {
                    $mc = MenuItemCategory::create([
                        'restaurant_id' => $store->id,
                        'name' => $mcName,
                        'description' => null,
                        'sort_order' => $sort++,
                        'is_available' => true,
                    ]);
                    $menuCategoryIds[] = $mc->id;
                }

                // Menu items per store (more data for mobile)
                $items = $this->menuItemsForType($type);
                $itemsPerStore = match ($type) {
                    'grocery' => 180,
                    'pharmacy' => 140,
                    'alcohol' => 120,
                    'flowers' => 80,
                    'pet' => 80,
                    default => 120,
                };

                // Guarantee at least 50 items per menu section when possible
                $perSectionMin = match ($type) {
                    'grocery', 'pharmacy', 'alcohol' => 50,
                    default => 20,
                };

                $sectionCounts = array_fill(0, count($menuCategoryIds), 0);
                for ($j = 0; $j < $itemsPerStore; $j++) {
                    $tpl = $faker->randomElement($items);
                    // Fill sections evenly then random
                    $idxToFill = array_search(min($sectionCounts), $sectionCounts, true);
                    if ($idxToFill === false) $idxToFill = 0;
                    $shouldForce = $sectionCounts[$idxToFill] < $perSectionMin;
                    $idx = $shouldForce ? $idxToFill : $faker->numberBetween(0, max(0, count($menuCategoryIds) - 1));
                    $sectionCounts[$idx]++;

                    $catId = $menuCategoryIds[$idx] ?? $faker->randomElement($menuCategoryIds);
                    $mcName = $menuCategoryNames[$idx] ?? $faker->randomElement($menuCategoryNames);

                    MenuItem::create([
                        'id' => (string) Str::uuid(),
                        'restaurant_id' => $store->id,
                        'name' => $tpl['name'].($faker->boolean(18) ? ' '.$faker->randomElement(['+', 'Max', 'Bio', 'Premium']) : ''),
                        'description' => $tpl['description'] ?? ($faker->boolean(50) ? $faker->sentence(10) : null),
                        'price' => (int) ($tpl['price'] ?? $faker->numberBetween(1000, 20000)),
                        'image' => $tpl['image'] ?? $this->menuItemImage($type, $mcName, $tpl['name'], "{$store->id}-{$j}"),
                        'category' => $mcName,
                        'category_id' => $catId,
                        'is_popular' => $faker->boolean(15),
                        'is_veg' => $faker->boolean(10),
                        'is_spicy' => $faker->boolean(8),
                        'is_available' => $faker->boolean(95),
                        'options' => null,
                    ]);
                }
            }
        }
    }

    /**
     * @return array<int, string>
     */
    private function menuCategoryNamesForType(string $type): array
    {
        return match ($type) {
            // Menu sections shown inside a store (RestaurantScreen tabs)
            'pharmacy' => ['Médicaments', 'Soins', 'Vitamines', 'Premiers soins', 'Bébé'],
            'grocery' => ['Fruits & Légumes', 'Céréales', 'Riz & pâtes', 'Épicerie', 'Boissons', 'Snacks', 'Produits laitiers', 'Viandes', 'Huiles', 'Ménage', 'Bébé'],
            'alcohol' => ['Bières', 'Vins', 'Spirits', 'Champagne', 'Cocktails', 'Sans alcool', 'Glace & snacks'],
            'flowers' => ['Anniversaire', 'Mariage', 'Romantique', 'Deuil', 'Congratulations'],
            'pet' => ['Croquettes', 'Jouets', 'Hygiène', 'Accessoires'],
            default => ['Entrées', 'Plats', 'Desserts', 'Boissons'],
        };
    }

    /**
     * @return array<int, array{name:string,description?:string,price?:int,image?:string}>
     */
    private function menuItemsForType(string $type): array
    {
        return match ($type) {
            'pharmacy' => [
                ['name' => 'Paracétamol 500mg', 'description' => 'Boîte de 16 comprimés', 'price' => 2500],
                ['name' => 'Ibuprofène 400mg', 'description' => 'Anti-inflammatoire', 'price' => 3500],
                ['name' => 'Vitamine C', 'description' => 'Comprimés effervescents', 'price' => 4000],
                ['name' => 'Masque chirurgical', 'description' => 'Pack x10', 'price' => 2000],
                ['name' => 'Gel hydroalcoolique', 'description' => '250ml', 'price' => 3000],
                ['name' => 'Sirop contre la toux', 'description' => '100ml', 'price' => 5000],
            ],
            'grocery' => [
                // Fruits
                ['name' => 'Banane (kg)', 'price' => 2500],
                ['name' => 'Mangues (kg)', 'price' => 4500],
                ['name' => 'Oranges (kg)', 'price' => 3500],
                ['name' => 'Ananas', 'price' => 4000],
                // Légumes
                ['name' => 'Tomates (kg)', 'price' => 2800],
                ['name' => 'Oignons (kg)', 'price' => 2500],
                ['name' => 'Pommes de terre (kg)', 'price' => 3500],
                ['name' => 'Carottes (kg)', 'price' => 3000],
                // Céréales & pâtes
                ['name' => 'Riz 5kg', 'price' => 12000],
                ['name' => 'Pâtes 1kg', 'price' => 4500],
                ['name' => 'Farine 2kg', 'price' => 6000],
                ['name' => 'Avoine 500g', 'price' => 5000],
                // Épicerie
                ['name' => 'Huile 1L', 'price' => 7000],
                ['name' => 'Sucre 1kg', 'price' => 3500],
                ['name' => 'Sel 1kg', 'price' => 1500],
                ['name' => 'Sauce tomate', 'price' => 2000],
                // Laitiers
                ['name' => 'Lait 1L', 'price' => 2200],
                ['name' => 'Yaourt', 'price' => 1800],
                ['name' => 'Fromage', 'price' => 6000],
                // Boissons & snacks
                ['name' => 'Eau 1.5L', 'price' => 1000],
                ['name' => 'Jus mangue', 'price' => 1800],
                ['name' => 'Soda 50cl', 'price' => 1500],
                ['name' => 'Biscuits', 'price' => 2000],
                ['name' => 'Chips', 'price' => 2500],
                // Boulangerie / Ménage
                ['name' => 'Pain', 'price' => 1500],
                ['name' => 'Savon', 'price' => 2000],
                ['name' => 'Détergent', 'price' => 7000],
            ],
            'alcohol' => [
                // Bières
                ['name' => 'Bière locale 65cl', 'price' => 2500],
                ['name' => 'Bière premium 33cl', 'price' => 3500],
                ['name' => 'Pack bière x6', 'price' => 18000],
                // Vins
                ['name' => 'Vin rouge', 'price' => 20000],
                ['name' => 'Vin blanc', 'price' => 20000],
                ['name' => 'Vin rosé', 'price' => 18000],
                // Whisky & spiritueux
                ['name' => 'Whisky', 'price' => 45000],
                ['name' => 'Vodka', 'price' => 35000],
                ['name' => 'Rhum', 'price' => 32000],
                ['name' => 'Gin', 'price' => 38000],
                ['name' => 'Champagne', 'price' => 60000],
                // Softs + snacks
                ['name' => 'Soda', 'price' => 1500],
                ['name' => 'Eau gazeuse', 'price' => 1500],
                ['name' => 'Glace', 'price' => 3000],
                ['name' => 'Cacahuètes', 'price' => 2500],
            ],
            'flowers' => [
                // Bouquets
                ['name' => 'Bouquet classique', 'price' => 15000],
                ['name' => 'Bouquet premium', 'price' => 30000],
                ['name' => 'Bouquet romantique', 'price' => 28000],
                // Roses
                ['name' => 'Roses rouges (12)', 'price' => 25000],
                ['name' => 'Roses blanches (12)', 'price' => 25000],
                ['name' => 'Roses mixtes (24)', 'price' => 45000],
                // Plantes & déco
                ['name' => 'Plante verte', 'price' => 12000],
                ['name' => 'Plante fleurie', 'price' => 18000],
                ['name' => 'Vase', 'price' => 12000],
                ['name' => 'Ruban + message', 'price' => 2000],
                ['name' => 'Carte cadeau', 'price' => 2000],
            ],
            'pet' => [
                ['name' => 'Croquettes 1kg', 'price' => 8000],
                ['name' => 'Jouet balle', 'price' => 3000],
                ['name' => 'Shampooing animal', 'price' => 6000],
                ['name' => 'Laisse', 'price' => 7000],
            ],
            default => [
                ['name' => 'Poulet braisé', 'price' => 9000],
                ['name' => 'Pizza Margherita', 'price' => 14000],
                ['name' => 'Burger Classic', 'price' => 8000],
                ['name' => 'Frites', 'price' => 2500],
                ['name' => 'Salade', 'price' => 5000],
                ['name' => 'Soda', 'price' => 1500],
                ['name' => 'Tiramisu', 'price' => 6000],
            ],
        };
    }

    /**
     * Deterministic-ish Unsplash image URL based on keywords + signature.
     *
     * @param array<int, string> $keywords
     */
    private function unsplashImage(array $keywords, string $sig): string
    {
        $q = implode(',', array_values(array_filter(array_map(function ($s) {
            $s = trim((string) $s);
            $s = preg_replace('/\s+/', ' ', $s);
            return $s;
        }, $keywords))));

        $q = rawurlencode($q ?: 'store');
        $sig = rawurlencode($sig);

        // 800x600 good for mobile cards; "sig" makes it vary per entry.
        return "https://source.unsplash.com/800x600/?{$q}&sig={$sig}";
    }

    private function menuItemImage(string $type, string $menuSection, string $name, string $sig): string
    {
        $base = match ($type) {
            'grocery' => 'groceries',
            'pharmacy' => 'medicine',
            'alcohol' => 'drink',
            'flowers' => 'flowers',
            'pet' => 'pet',
            default => 'food',
        };

        return $this->unsplashImage([$base, $menuSection, $name], $sig);
    }
}

