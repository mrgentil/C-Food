<?php

namespace App\Http\Controllers;

use App\Models\AdBanner;
use Illuminate\Http\Request;

class AdBannerController extends Controller
{
    /**
     * GET /api/ad-banners
     * Public endpoint: returns active banners ordered by order_index.
     */
    public function index()
    {
        $banners = AdBanner::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $banners,
        ]);
    }
}
