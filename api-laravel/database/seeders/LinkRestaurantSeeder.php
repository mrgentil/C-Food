<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Restaurant;

class LinkRestaurantSeeder extends Seeder
{
    public function run()
    {
        $restaurantUser = User::where('is_restaurant', true)->first();
        
        if ($restaurantUser) {
            // Link first restaurant to this user
            $restaurant = Restaurant::first();
            if ($restaurant) {
                $restaurant->update(['user_id' => $restaurantUser->id]);
                echo "Linked restaurant {$restaurant->name} to user {$restaurantUser->email}\n";
            }
        }
    }
}
