<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ShopType;

class ShopTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = ShopType::where('status', true)->orderBy('order_index');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        return response()->json(['data' => $query->get()]);
    }
}
