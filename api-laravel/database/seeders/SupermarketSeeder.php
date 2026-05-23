<?php

namespace Database\Seeders;

use App\Models\AppTab;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\MenuItemCategory;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Supermarchés démo : onglet app + rayons (catégories globales) + plusieurs magasins avec menu.
 */
class SupermarketSeeder extends Seeder
{
    public function run(): void
    {
        AppTab::updateOrCreate(
            ['slug' => 'supermarket'],
            [
                'name' => 'Supermarché',
                'icon' => 'storefront-outline',
                'sort_order' => 12,
                'is_home_tab' => false,
                'is_published' => true,
            ]
        );

        $rayons = $this->rayonsMeta();
        $categoryIds = $this->ensureSupermarketCategories($rayons);
        $templates = $this->menuTemplatesByRayon();

        $stores = [
            [
                'id' => 'f7e2b9a0-4c1d-4f8e-9b2a-1a2b3c4d5e6f',
                'owner_email' => 'supermarche@c-food.com',
                'owner_display_name' => 'Galaxy Supermarché',
                'name' => 'Galaxy Supermarché Gombe',
                'description' => 'Grand supermarché : frais, épicerie, boissons, surgelés, entretien et bazar. Livraison à domicile.',
                'address' => 'Avenue du Commerce, Gombe, Kinshasa',
                'phone' => '+243970000001',
                'image' => 'https://images.unsplash.com/photo-1604719312566-8912e9227c8a?w=800',
                'rating' => 4.6,
                'review_count' => 428,
                'delivery_time' => '30-45 min',
                'delivery_fee' => 2000,
                'distance' => 1.2,
                'min_order' => 5000,
                'is_featured' => true,
                'is_new' => true,
                'is_promoted' => false,
                'discount' => '-10%',
                'latitude' => -4.3250,
                'longitude' => 15.3135,
            ],
            [
                'id' => 'a1c2e3f4-5b6d-47a8-9c0d-ef1234567890',
                'owner_email' => 'bandal.market@c-food.com',
                'owner_display_name' => 'Marché Bandal',
                'name' => 'Marché Moderne Bandal',
                'description' => 'Supermarché de quartier : produits frais quotidiens, courses du dimanche, promotions rayon frais.',
                'address' => 'Avenue Victoire, Bandalungwa, Kinshasa',
                'phone' => '+243970000002',
                'image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
                'rating' => 4.4,
                'review_count' => 186,
                'delivery_time' => '25-40 min',
                'delivery_fee' => 1800,
                'distance' => 2.1,
                'min_order' => 4000,
                'is_featured' => true,
                'is_new' => false,
                'is_promoted' => true,
                'discount' => null,
                'latitude' => -4.3335,
                'longitude' => 15.2820,
            ],
            [
                'id' => 'b2d3f4a5-6c7e-48b9-0d1e-f01234567891',
                'owner_email' => 'limete.express@c-food.com',
                'owner_display_name' => 'Limete Express',
                'name' => 'Express Market Limete',
                'description' => 'Courses rapides : snacking, boissons fraîches, produits du quotidien jusqu’au soir.',
                'address' => 'Boulevard Lumumba, Limete, Kinshasa',
                'phone' => '+243970000003',
                'image' => 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800',
                'rating' => 4.5,
                'review_count' => 312,
                'delivery_time' => '20-35 min',
                'delivery_fee' => 1500,
                'distance' => 3.4,
                'min_order' => 3500,
                'is_featured' => false,
                'is_new' => true,
                'is_promoted' => false,
                'discount' => '-5%',
                'latitude' => -4.3420,
                'longitude' => 15.3080,
            ],
            [
                'id' => 'c3e4a5b6-7d8f-49c0-1e2f-0123456789ab',
                'owner_email' => 'kintambo.city@c-food.com',
                'owner_display_name' => 'City Market Kintambo',
                'name' => 'City Market Kintambo',
                'description' => 'Grand choix épicerie et produits importés, boucherie et primeurs le matin.',
                'address' => 'Avenue Kalembelembe, Kintambo, Kinshasa',
                'phone' => '+243970000004',
                'image' => 'https://images.unsplash.com/photo-1588964895597-cfccd6bf2d24?w=800',
                'rating' => 4.7,
                'review_count' => 251,
                'delivery_time' => '35-50 min',
                'delivery_fee' => 2200,
                'distance' => 4.0,
                'min_order' => 6000,
                'is_featured' => true,
                'is_new' => false,
                'is_promoted' => false,
                'discount' => null,
                'latitude' => -4.3180,
                'longitude' => 15.2650,
            ],
        ];

        foreach ($stores as $storeRow) {
            $this->seedOneSupermarket($storeRow, $categoryIds, array_keys($rayons), $templates);
        }
    }

    /**
     * @param  array<string, array{icon: string, color: string}>  $rayons
     * @return list<int>
     */
    private function ensureSupermarketCategories(array $rayons): array
    {
        $categoryIds = [];
        foreach ($rayons as $name => $meta) {
            $cat = Category::firstOrCreate(
                ['name' => $name],
                [
                    'icon' => $meta['icon'],
                    'color' => $meta['color'],
                    'show_on_home' => false,
                    'store_type' => 'supermarket',
                ]
            );
            $cat->update([
                'icon' => $meta['icon'],
                'color' => $meta['color'],
                'show_on_home' => false,
                'store_type' => 'supermarket',
            ]);
            $categoryIds[] = $cat->id;
        }

        return $categoryIds;
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  list<int>  $categoryIds
     * @param  list<string>  $rayonOrder
     * @param  array<string, array<int, array{name: string, price: int, description?: string}>>  $templates
     */
    private function seedOneSupermarket(array $row, array $categoryIds, array $rayonOrder, array $templates): void
    {
        $owner = User::updateOrCreate(
            ['email' => $row['owner_email']],
            [
                'name' => $row['owner_display_name'],
                'password' => Hash::make('password123'),
                'phone' => $row['phone'] ?? '+243800000099',
                'is_admin' => false,
                'is_merchant' => true,
                'is_restaurant' => false,
                'is_driver' => false,
            ]
        );

        $store = Restaurant::updateOrCreate(
            ['id' => $row['id']],
            [
                'name' => $row['name'],
                'type' => 'supermarket',
                'owner_user_id' => $owner->id,
                'user_id' => $owner->id,
                'description' => $row['description'],
                'address' => $row['address'],
                'phone' => $row['phone'],
                'image' => $row['image'],
                'rating' => $row['rating'],
                'review_count' => $row['review_count'],
                'delivery_time' => $row['delivery_time'],
                'delivery_fee' => $row['delivery_fee'],
                'distance' => $row['distance'],
                'min_order' => $row['min_order'],
                'is_open' => true,
                'is_featured' => $row['is_featured'],
                'is_new' => $row['is_new'],
                'is_promoted' => $row['is_promoted'],
                'discount' => $row['discount'],
                'latitude' => $row['latitude'],
                'longitude' => $row['longitude'],
            ]
        );

        $store->categories()->sync($categoryIds);

        $store->menuItems()->delete();
        $store->menuCategories()->delete();

        $sort = 0;
        foreach ($rayonOrder as $rayonName) {
            $mc = MenuItemCategory::create([
                'restaurant_id' => $store->id,
                'name' => $rayonName,
                'description' => null,
                'sort_order' => $sort++,
                'is_available' => true,
            ]);

            $items = $templates[$rayonName] ?? [
                ['name' => 'Produit '.$rayonName, 'price' => 3500, 'description' => 'Sélection du rayon'],
            ];
            foreach ($items as $itemRow) {
                MenuItem::create([
                    'id' => (string) Str::uuid(),
                    'restaurant_id' => $store->id,
                    'name' => $itemRow['name'],
                    'description' => $itemRow['description'] ?? null,
                    'price' => (int) $itemRow['price'],
                    'image' => null,
                    'category' => $rayonName,
                    'category_id' => $mc->id,
                    'is_popular' => false,
                    'is_veg' => false,
                    'is_spicy' => false,
                    'is_available' => true,
                    'options' => null,
                ]);
            }
        }
    }

    /**
     * @return array<string, array{icon: string, color: string}>
     */
    private function rayonsMeta(): array
    {
        return [
            'Boucherie & poissonnerie' => ['icon' => 'fish-outline', 'color' => '#DC2626'],
            'Primeurs & salades' => ['icon' => 'nutrition-outline', 'color' => '#22C55E'],
            'Crémerie & fromagerie' => ['icon' => 'snow-outline', 'color' => '#60A5FA'],
            'Épicerie salée' => ['icon' => 'restaurant-outline', 'color' => '#CA8A04'],
            'Épicerie sucrée' => ['icon' => 'ice-cream-outline', 'color' => '#EC4899'],
            'Eaux & softs' => ['icon' => 'water-outline', 'color' => '#2563EB'],
            'Surgelés & glaces' => ['icon' => 'snow-outline', 'color' => '#0EA5E9'],
            'Hygiène & beauté' => ['icon' => 'sparkles-outline', 'color' => '#7C3AED'],
            'Maison & accessoires' => ['icon' => 'construct-outline', 'color' => '#78716C'],
            'Pain & pâtisserie' => ['icon' => 'cafe-outline', 'color' => '#B45309'],
        ];
    }

    /**
     * @return array<string, array<int, array{name: string, price: int, description?: string}>>
     */
    private function menuTemplatesByRayon(): array
    {
        return [
            'Boucherie & poissonnerie' => [
                ['name' => 'Filet de poulet 1 kg', 'price' => 8500, 'description' => 'Frais'],
                ['name' => 'Bœuf haché 500 g', 'price' => 12000, 'description' => 'Label Rouge'],
                ['name' => 'Saumon steak 2 pcs', 'price' => 18500, 'description' => 'Surgelé ou frais selon arrivage'],
                ['name' => 'Côtes de porc', 'price' => 9500, 'description' => 'Au kg'],
            ],
            'Primeurs & salades' => [
                ['name' => 'Salade iceberg', 'price' => 2500, 'description' => 'La pièce'],
                ['name' => 'Tomates grappe 1 kg', 'price' => 3000, 'description' => ''],
                ['name' => 'Banane plantain', 'price' => 2000, 'description' => 'Botte'],
                ['name' => 'Avocat Hass', 'price' => 4000, 'description' => 'x2'],
            ],
            'Crémerie & fromagerie' => [
                ['name' => 'Lait 1 L', 'price' => 3500, 'description' => 'Entier'],
                ['name' => 'Yaourt nature x4', 'price' => 2800, 'description' => ''],
                ['name' => 'Emmental râpé 200 g', 'price' => 6500, 'description' => ''],
                ['name' => 'Beurre 250 g', 'price' => 5500, 'description' => 'Demi-sel'],
            ],
            'Épicerie salée' => [
                ['name' => 'Riz parfumé 5 kg', 'price' => 22000, 'description' => ''],
                ['name' => 'Huile tournesol 2 L', 'price' => 12000, 'description' => ''],
                ['name' => 'Pâtes penne 500 g', 'price' => 3500, 'description' => ''],
                ['name' => 'Cube bouillon x8', 'price' => 1500, 'description' => ''],
            ],
            'Épicerie sucrée' => [
                ['name' => 'Céréales enfants 500 g', 'price' => 8000, 'description' => ''],
                ['name' => 'Confiture fraise 370 g', 'price' => 4500, 'description' => ''],
                ['name' => 'Biscuits sablés', 'price' => 3200, 'description' => 'Paquet'],
                ['name' => 'Chocolat noir 100 g', 'price' => 4000, 'description' => ''],
            ],
            'Eaux & softs' => [
                ['name' => 'Eau minérale 1,5 L x6', 'price' => 5000, 'description' => 'Pack'],
                ['name' => 'Jus orange 1 L', 'price' => 4500, 'description' => ''],
                ['name' => 'Soda cola 1 L', 'price' => 2000, 'description' => ''],
                ['name' => 'Thé glacé pêche', 'price' => 2500, 'description' => 'Bouteille'],
            ],
            'Surgelés & glaces' => [
                ['name' => 'Légumes mijoté 600 g', 'price' => 5500, 'description' => 'Surgelé'],
                ['name' => 'Frites four 1 kg', 'price' => 4500, 'description' => ''],
                ['name' => 'Glace vanille 500 ml', 'price' => 6000, 'description' => ''],
                ['name' => 'Poisson pané x4', 'price' => 9500, 'description' => ''],
            ],
            'Hygiène & beauté' => [
                ['name' => 'Gel douche 400 ml', 'price' => 5500, 'description' => ''],
                ['name' => 'Papier toilette x12', 'price' => 12000, 'description' => ''],
                ['name' => 'Dentifrice famille', 'price' => 3500, 'description' => ''],
                ['name' => 'Shampooing 250 ml', 'price' => 7000, 'description' => ''],
            ],
            'Maison & accessoires' => [
                ['name' => 'Sacs poubelle x20', 'price' => 4000, 'description' => ''],
                ['name' => 'Éponges vaisselle x3', 'price' => 2000, 'description' => ''],
                ['name' => 'Lessive liquide 1,5 L', 'price' => 15000, 'description' => ''],
                ['name' => 'Pile AA x4', 'price' => 3500, 'description' => ''],
            ],
            'Pain & pâtisserie' => [
                ['name' => 'Baguette tradition', 'price' => 1000, 'description' => ''],
                ['name' => 'Pain de mie grandes tranches', 'price' => 3500, 'description' => ''],
                ['name' => 'Croissant x4', 'price' => 4500, 'description' => ''],
                ['name' => 'Éclair chocolat', 'price' => 2500, 'description' => 'Unité'],
            ],
        ];
    }
}
