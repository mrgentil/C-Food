<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminSettingWebController extends Controller
{
    public function edit()
    {
        $settings = Setting::pluck('value', 'key')->toArray();
        return view('admin.settings', compact('settings'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'primary_color' => 'nullable|string|max:20',
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('settings', 'public');
            Setting::updateOrCreate(
                ['key' => 'app_logo'],
                ['value' => Storage::url($path)]
            );
        }

        if ($request->has('primary_color')) {
            Setting::updateOrCreate(
                ['key' => 'primary_color'],
                ['value' => $request->primary_color]
            );
        }

        return redirect()->route('admin.settings')->with('success', 'Paramètres mis à jour avec succès.');
    }
}
