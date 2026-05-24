<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AdBanner;

class AdBannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Livraison GRATUITE',
                'subtitle' => 'Sur votre 1ère commande avec le code BIENVENUE',
                'image' => 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
                'color' => '#0EA5E9',
                'action_type' => null,
                'action_value' => null,
                'order_index' => 0,
                'is_active' => true,
            ],
            [
                'title' => '-30% sur les Pizzas',
                'subtitle' => 'Offre limitée ce weekend uniquement',
                'image' => 'https://images.pexels.com/photos/1049620/pexels-photo-1049620.jpeg?auto=compress&cs=tinysrgb&w=800',
                'color' => '#FF6B00',
                'action_type' => null,
                'action_value' => null,
                'order_index' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Parrainez un ami',
                'subtitle' => 'Gagnez 5000 FC pour chaque ami parrainé',
                'image' => 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800',
                'color' => '#8B5CF6',
                'action_type' => null,
                'action_value' => null,
                'order_index' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Menu du jour',
                'subtitle' => 'Découvrez notre sélection spéciale à petit prix',
                'image' => 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
                'color' => '#10B981',
                'action_type' => null,
                'action_value' => null,
                'order_index' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $banner) {
            AdBanner::updateOrCreate(
                ['title' => $banner['title']],
                $banner
            );
        }
    }
}
