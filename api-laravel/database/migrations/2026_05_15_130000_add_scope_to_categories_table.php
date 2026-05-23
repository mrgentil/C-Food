<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->boolean('show_on_home')->default(false)->after('image');
            $table->string('store_type', 64)->nullable()->after('show_on_home');
        });

        $homeNames = [
            'Fast Food', 'Asiatique', 'Pizza', 'Burger', 'Healthy', 'Desserts',
            'Boissons', 'Local', 'Poulet', 'Poisson',
        ];

        $byType = [
            'restaurant' => ['Pizza', 'Burger', 'Local', 'Poulet', 'Poisson', 'Desserts', 'Boissons', 'Healthy'],
            'pharmacy' => ['Médicaments', 'Soins', 'Bébé', 'Vitamines', 'Premiers soins'],
            'grocery' => ['Fruits & Légumes', 'Céréales', 'Produits laitiers', 'Viandes', 'Huiles', 'Snacks'],
            'alcohol' => ['Bières', 'Vins', 'Spirits', 'Champagne', 'Cocktails', 'Sans alcool'],
            'flowers' => ['Anniversaire', 'Mariage', 'Romantique', 'Deuil', 'Congratulations'],
            'pet' => ['Nourriture', 'Accessoires', 'Hygiène', 'Jouets', 'Vétérinaire'],
        ];

        DB::table('categories')->whereIn('name', $homeNames)->update([
            'show_on_home' => true,
            'store_type' => 'restaurant',
        ]);

        foreach ($byType as $type => $names) {
            DB::table('categories')->whereIn('name', $names)->update([
                'show_on_home' => $type === 'restaurant',
                'store_type' => $type,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['show_on_home', 'store_type']);
        });
    }
};
