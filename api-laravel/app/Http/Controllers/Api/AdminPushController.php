<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushCampaign;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\NotificationController;

class AdminPushController extends Controller
{
    public function index()
    {
        $campaigns = PushCampaign::orderBy('created_at', 'desc')->paginate(10);
        return view('admin.push-campaigns', compact('campaigns'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'target_audience' => 'required|in:all,clients,drivers,merchants',
        ]);

        $query = User::whereNotNull('expo_push_token');

        if ($validated['target_audience'] === 'clients') {
            $query->where('is_admin', false)->where('is_driver', false)->where('is_merchant', false);
        } elseif ($validated['target_audience'] === 'drivers') {
            $query->where('is_driver', true);
        } elseif ($validated['target_audience'] === 'merchants') {
            $query->where('is_merchant', true)->orWhere('is_restaurant', true);
        }

        $tokens = $query->pluck('expo_push_token')->toArray();
        $sentCount = 0;

        // Group by batches of 100 as recommended by Expo API limits
        $batches = array_chunk($tokens, 100);

        foreach ($batches as $batch) {
            foreach ($batch as $token) {
                try {
                    NotificationController::sendExpoPush(
                        $token,
                        $validated['title'],
                        $validated['body'],
                        ['type' => 'marketing']
                    );
                    $sentCount++;
                } catch (\Throwable $e) {
                    // Ignore errors for individual tokens
                }
            }
        }

        PushCampaign::create([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'target_audience' => $validated['target_audience'],
            'sent_count' => $sentCount,
            'status' => 'sent',
        ]);

        return back()->with('success', "Campagne envoyée avec succès à {$sentCount} appareil(s).");
    }
}
