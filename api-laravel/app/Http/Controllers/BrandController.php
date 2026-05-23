<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Brand;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::where('status', true)->orderBy('order_index');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json(['data' => $query->get()]);
    }
}
