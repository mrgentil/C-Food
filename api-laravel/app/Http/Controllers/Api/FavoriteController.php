<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Favorite;
use App\Models\Restaurant;

use App\Http\Controllers\Controller as BaseController;

class FavoriteController extends BaseController
{
    public function index(Request $request)
    {
        $user = $request->user();
        $favorites = Favorite::where('user_id', $user->id)
            ->with('restaurant')
            ->get();

        return response()->json(['data' => $favorites]);
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|string|exists:restaurants,id',
        ]);

        $user = $request->user();
        $favorite = Favorite::where('user_id', $user->id)
            ->where('restaurant_id', $validated['restaurant_id'])
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json(['message' => 'Restaurant removed from favorites', 'is_favorite' => false]);
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'restaurant_id' => $validated['restaurant_id'],
            ]);
            return response()->json(['message' => 'Restaurant added to favorites', 'is_favorite' => true]);
        }
    }

    public function check(Request $request, $restaurantId)
    {
        $user = $request->user();
        $isFavorite = Favorite::where('user_id', $user->id)
            ->where('restaurant_id', $restaurantId)
            ->exists();

        return response()->json(['is_favorite' => $isFavorite]);
    }
}
