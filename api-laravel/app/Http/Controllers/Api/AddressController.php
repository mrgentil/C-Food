<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\Validator;

use App\Http\Controllers\Controller as BaseController;

class AddressController extends BaseController
{
    public function index(Request $request)
    {
        $user = $request->user();
        $addresses = Address::where('user_id', $user->id)->get();

        return response()->json(['data' => $addresses]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'street' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'instructions' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_default' => 'nullable|boolean',
        ]);

        $user = $request->user();

        // If setting as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address = Address::create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        return response()->json(['data' => $address], 201);
    }

    public function update(Request $request, $id)
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'label' => 'sometimes|string|max:255',
            'street' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'instructions' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_default' => 'nullable|boolean',
        ]);

        // If setting as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json(['data' => $address]);
    }

    public function destroy(Request $request, $id)
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);
        $address->delete();

        return response()->json(['message' => 'Address deleted successfully']);
    }

    public function setDefault(Request $request, $id)
    {
        $user = $request->user();

        Address::where('user_id', $user->id)->update(['is_default' => false]);

        $address = Address::where('user_id', $user->id)->findOrFail($id);
        $address->update(['is_default' => true]);

        return response()->json(['data' => $address]);
    }
}
