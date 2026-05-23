<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();
        
        // Ensure full URL for logo if it's a relative path
        if (isset($settings['app_logo']) && str_starts_with($settings['app_logo'], '/storage')) {
            $settings['app_logo'] = url($settings['app_logo']);
        }

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }
}
