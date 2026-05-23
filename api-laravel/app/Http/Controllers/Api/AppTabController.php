<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppTab;

class AppTabController extends Controller
{
    public function index()
    {
        $tabs = AppTab::query()
            ->published()
            ->ordered()
            ->get(['id', 'slug', 'name', 'icon', 'sort_order', 'is_home_tab']);

        return response()->json(['tabs' => $tabs]);
    }
}
