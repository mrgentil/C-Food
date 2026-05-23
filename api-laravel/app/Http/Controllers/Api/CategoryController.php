<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::query()->onHome()->orderBy('name')->get();
        return response()->json(['categories' => $categories]);
    }

    public function restaurants($id)
    {
        $category = Category::with('restaurants')->find($id);

        if (!$category) {
            return response()->json(['message' => 'Catégorie non trouvée'], 404);
        }

        return response()->json(['category' => $category, 'restaurants' => $category->restaurants]);
    }
}
