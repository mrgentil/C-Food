<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller as BaseController;
use App\Models\Order;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\NotificationController;
use App\Support\OrderPayment;

class RestaurantController extends BaseController
{
    private function applyDistanceQuery($query, ?float $lat, ?float $lng)
    {
        if ($lat === null || $lng === null) {
            return $query;
        }

        // Haversine (km). Works for MySQL/MariaDB.
        // We compute a runtime distance_km, then expose it as `distance` (km) for the mobile app.
        $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))";
        return $query
            ->select('restaurants.*')
            ->selectRaw("$haversine as distance_km", [$lat, $lng, $lat]);
    }

    // API methods (for mobile)
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Restaurant::query()->with('categories');

        if ($user && ($user->is_merchant || $user->is_restaurant)) {
            $query->where(function ($q) use ($user) {
                $q->where('owner_user_id', $user->id)
                  ->orWhere('user_id', $user->id);
            });
        } else {
            $query->where('is_open', true);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        $request->validate([
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'radius_km' => 'nullable|numeric|min:0.1|max:200',
        ]);

        $lat = $request->filled('lat') ? (float) $request->input('lat') : null;
        $lng = $request->filled('lng') ? (float) $request->input('lng') : null;
        $radiusKm = $request->filled('radius_km') ? (float) $request->input('radius_km') : null;

        // Only apply distance if we have coordinates and restaurants have coordinates.
        $query = $this->applyDistanceQuery($query, $lat, $lng);

        if ($lat !== null && $lng !== null) {
            $query->whereNotNull('latitude')->whereNotNull('longitude');
            if ($radiusKm !== null) {
                $query->having('distance_km', '<=', $radiusKm);
            }
            $query->orderBy('distance_km');
        } else {
            $query->orderByDesc('is_featured')->orderBy('name');
        }

        $restaurants = $query->get()->map(function ($r) use ($lat, $lng) {
            // Preserve existing `distance` column if coords not provided.
            if ($lat !== null && $lng !== null && isset($r->distance_km)) {
                $r->distance = round((float) $r->distance_km, 1); // km
            }
            unset($r->distance_km);
            return $r;
        });

        return response()->json(['data' => $restaurants]);
    }

    public function featured(Request $request)
    {
        $user = $request->user();

        $query = Restaurant::query()->with('categories')->where('is_featured', true);

        if ($user && ($user->is_merchant || $user->is_restaurant)) {
            $query->where(function ($q) use ($user) {
                $q->where('owner_user_id', $user->id)
                  ->orWhere('user_id', $user->id);
            });
        } else {
            $query->where('is_open', true);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        $restaurants = $query->orderByDesc('rating')->orderBy('name')->get();

        return response()->json(['data' => $restaurants]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|max:100',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'radius_km' => 'nullable|numeric|min:0.1|max:200',
        ]);

        $user = $request->user();
        $qStr = trim((string) $request->input('q', ''));

        $query = Restaurant::query()->with('categories');

        if ($user && ($user->is_merchant || $user->is_restaurant)) {
            $query->where(function ($w) use ($user) {
                $w->where('owner_user_id', $user->id)
                  ->orWhere('user_id', $user->id);
            });
        } else {
            $query->where('is_open', true);
        }

        if ($qStr !== '') {
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $qStr);
            $needle = '%'.$escaped.'%';
            // Nom / description du commerce + plats disponibles (nom, description, rayon) + titres de sections menu
            $query->where(function ($sub) use ($needle) {
                $sub->where('restaurants.name', 'like', $needle)
                    ->orWhere('restaurants.description', 'like', $needle)
                    ->orWhereHas('menuItems', function ($mq) use ($needle) {
                        $mq->where('is_available', true)
                            ->where(function ($m) use ($needle) {
                                $m->where('name', 'like', $needle)
                                    ->orWhere('description', 'like', $needle)
                                    ->orWhere('category', 'like', $needle);
                            });
                    })
                    ->orWhereHas('menuCategories', function ($catq) use ($needle) {
                        $catq->where('name', 'like', $needle);
                    });
            });
        }

        // Pass-through filters used by the mobile client
        $query->when($request->filled('type'), fn ($qq) => $qq->where('type', $request->string('type')));

        $lat = $request->filled('lat') ? (float) $request->input('lat') : null;
        $lng = $request->filled('lng') ? (float) $request->input('lng') : null;
        $radiusKm = $request->filled('radius_km') ? (float) $request->input('radius_km') : null;

        $query = $this->applyDistanceQuery($query, $lat, $lng);
        if ($lat !== null && $lng !== null) {
            $query->whereNotNull('latitude')->whereNotNull('longitude');
            if ($radiusKm !== null) $query->having('distance_km', '<=', $radiusKm);
            $query->orderBy('distance_km');
        } else {
            $query->orderByDesc('is_featured')->orderBy('name');
        }

        $restaurants = $query->limit(50)->get()->map(function ($r) use ($lat, $lng) {
            if ($lat !== null && $lng !== null && isset($r->distance_km)) {
                $r->distance = round((float) $r->distance_km, 1);
            }
            unset($r->distance_km);
            return $r;
        });

        return response()->json(['data' => $restaurants]);
    }

    public function show(Request $request, string $id)
    {
        $user = $request->user();

        $query = Restaurant::query()->with('categories')->whereKey($id);

        if ($user && ($user->is_merchant || $user->is_restaurant)) {
            $query->where(function ($q) use ($user) {
                $q->where('owner_user_id', $user->id)
                  ->orWhere('user_id', $user->id);
            });
        }

        $restaurant = $query->firstOrFail();

        return response()->json(['data' => $restaurant]);
    }

    public function menu(string $id)
    {
        $menuItems = MenuItem::where('restaurant_id', $id)
            ->with('options')
            ->get();

        return response()->json(['data' => $menuItems]);
    }

    // Web Dashboard (restaurant panel)
    public function webDashboard()
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        if ($restaurants->isEmpty()) {
            return redirect()->route('restaurant.setup');
        }

        $selectedRestaurantId = session('selected_restaurant_id', $restaurants->first()->id);
        $restaurant = $restaurants->where('id', $selectedRestaurantId)->first() ?? $restaurants->first();

        $stats = [
            'orders_count' => Order::where('restaurant_id', $restaurant->id)->count(),
            'pending_orders' => Order::where('restaurant_id', $restaurant->id)->where('status', 'pending')->count(),
            'revenue' => Order::where('restaurant_id', $restaurant->id)->where('status', '!=', 'cancelled')->sum('total'),
            'menu_items_count' => MenuItem::where('restaurant_id', $restaurant->id)->count(),
        ];

        $recentOrders = Order::where('restaurant_id', $restaurant->id)
            ->with(['user', 'driver'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('restaurant.dashboard', compact('restaurant', 'restaurants', 'stats', 'recentOrders'));
    }

    // Restaurant setup (create profile)
    public function webSetup()
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        $editId = request()->string('edit')->toString();
        $editRestaurant = null;
        if (!empty($editId)) {
            $editRestaurant = $restaurants->firstWhere('id', $editId);
        }

        return view('restaurant.setup', compact('restaurants', 'editRestaurant'));
    }

    public function webSaveSetup(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:restaurant,grocery,supermarket,alcohol,flowers,pharmacy,pet',
            'description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'delivery_fee' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|max:4096',
            'logo' => 'nullable|string|max:255',
            'logo_file' => 'nullable|image|max:4096',
        ]);

        $user = Auth::user();

        $imageValue = $request->string('image')->toString() ?: null;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('stores', 'public');
            $imageValue = Storage::url($path);
        }

        $logoValue = $request->string('logo')->toString() ?: null;
        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('stores/logos', 'public');
            $logoValue = Storage::url($path);
        }

        [$lat, $lng] = $this->geocodeAddress($request->address);

        Restaurant::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'owner_user_id' => $user->id,
            'name' => $request->name,
            'type' => $request->type,
            'description' => $request->description,
            'address' => $request->address,
            'phone' => $request->phone,
            'website' => $request->website,
            'email' => $request->email,
            'delivery_fee' => (int) $request->delivery_fee,
            'image' => $imageValue,
            'logo' => $logoValue,
            'latitude' => $lat,
            'longitude' => $lng,
            'is_open' => true,
        ]);

        return redirect()->route('restaurant.dashboard')->with('success', 'Établissement créé avec succès');
    }

    public function webUpdateStore(Request $request, string $id)
    {
        $user = Auth::user();
        $restaurant = Restaurant::where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('owner_user_id', $user->id)->orWhere('user_id', $user->id);
            })
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:restaurant,grocery,supermarket,alcohol,flowers,pharmacy,pet',
            'description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'delivery_fee' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|max:4096',
            'logo' => 'nullable|string|max:255',
            'logo_file' => 'nullable|image|max:4096',
            'is_open' => 'nullable|boolean',
        ]);

        $imageValue = $request->string('image')->toString() ?: $restaurant->image;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('stores', 'public');
            $imageValue = Storage::url($path);
        }

        $logoValue = $request->string('logo')->toString() ?: $restaurant->logo;
        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('stores/logos', 'public');
            $logoValue = Storage::url($path);
        }

        $lat = $restaurant->latitude;
        $lng = $restaurant->longitude;
        $addressChanged = ($validated['address'] ?? '') !== (string) $restaurant->address;
        if ($addressChanged || empty($lat) || empty($lng)) {
            [$lat2, $lng2] = $this->geocodeAddress($validated['address']);
            $lat = $lat2;
            $lng = $lng2;
        }

        $restaurant->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
            'address' => $validated['address'],
            'phone' => $validated['phone'],
            'website' => $validated['website'] ?? null,
            'email' => $validated['email'] ?? null,
            'delivery_fee' => (int) $validated['delivery_fee'],
            'image' => $imageValue,
            'logo' => $logoValue,
            'latitude' => $lat,
            'longitude' => $lng,
            'is_open' => (bool) ($validated['is_open'] ?? $restaurant->is_open),
        ]);

        return redirect()->route('restaurant.setup', ['edit' => $restaurant->id])
            ->with('success', 'Établissement mis à jour.');
    }

    private function geocodeAddress(string $address): array
    {
        $address = trim($address);
        if ($address === '') return [null, null];

        try {
            $res = Http::withHeaders([
                'User-Agent' => 'C-Food/1.0 (local dev)',
            ])->get('https://nominatim.openstreetmap.org/search', [
                'q' => $address,
                'format' => 'json',
                'limit' => 1,
            ]);

            if (!$res->ok()) return [null, null];
            $data = $res->json();
            if (!is_array($data) || empty($data[0])) return [null, null];
            $lat = isset($data[0]['lat']) ? (float) $data[0]['lat'] : null;
            $lng = isset($data[0]['lon']) ? (float) $data[0]['lon'] : null;
            if (!is_finite((float) $lat) || !is_finite((float) $lng)) return [null, null];
            return [$lat, $lng];
        } catch (\Throwable $e) {
            return [null, null];
        }
    }

    // Switch active restaurant
    public function switchRestaurant(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
        ]);

        $user = Auth::user();
        $restaurant = Restaurant::where('id', $request->restaurant_id)
            ->where(function ($q) use ($user) {
                $q->where('owner_user_id', $user->id)
                  ->orWhere('user_id', $user->id);
            })
            ->firstOrFail();

        session(['selected_restaurant_id' => $restaurant->id]);

        return redirect()->route('restaurant.dashboard');
    }

    // Menu CRUD
    public function webMenu()
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        if ($restaurants->isEmpty()) {
            return redirect()->route('restaurant.setup')
                ->with('error', 'Créez d’abord un établissement pour gérer le menu.');
        }

        $selectedRestaurantId = session('selected_restaurant_id', $restaurants->first()->id);

        if (! $selectedRestaurantId) {
            return redirect()->route('restaurant.setup');
        }

        $restaurant = Restaurant::findOrFail($selectedRestaurantId);

        $menuItems = MenuItem::where('restaurant_id', $restaurant->id)
            ->with('options')
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return view('restaurant.menu', compact('menuItems', 'restaurant', 'restaurants'));
    }

    public function webCreateMenuItem()
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        if ($restaurants->isEmpty()) {
            return redirect()->route('restaurant.setup')
                ->with('error', 'Créez d’abord un établissement avant d’ajouter des articles au menu.');
        }

        $selectedRestaurantId = session('selected_restaurant_id', $restaurants->first()->id);

        return view('restaurant.menu-form', [
            'menuItem' => null,
            'restaurants' => $restaurants,
            'selectedRestaurantId' => $selectedRestaurantId,
        ]);
    }

    public function webStoreMenuItem(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:100',
            'image' => 'nullable|string|max:2048',
            'image_file' => 'nullable|image|max:4096',
            'restaurant_id' => 'required|exists:restaurants,id',
            'is_available' => 'nullable|boolean',
            'is_popular' => 'nullable|boolean',
            'is_veg' => 'nullable|boolean',
            'is_spicy' => 'nullable|boolean',
        ]);

        $user = Auth::user();
        $restaurant = Restaurant::where('id', $request->restaurant_id)
            ->where(function ($q) use ($user) {
                $q->where('owner_user_id', $user->id)
                  ->orWhere('user_id', $user->id);
            })
            ->firstOrFail();

        $imageValue = $request->string('image')->toString() ?: null;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('menu-items', 'public');
            $imageValue = Storage::url($path);
        }

        MenuItem::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'restaurant_id' => $restaurant->id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
            'image' => $imageValue,
            'is_available' => $request->has('is_available'),
            'is_popular' => $request->has('is_popular'),
            'is_veg' => $request->has('is_veg'),
            'is_spicy' => $request->has('is_spicy'),
        ]);

        return redirect()->route('restaurant.menu')->with('success', 'Article ajouté');
    }

    public function webEditMenuItem($id)
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        $menuItem = MenuItem::where('id', $id)
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->firstOrFail();

        return view('restaurant.menu-form', [
            'menuItem' => $menuItem,
            'restaurants' => $restaurants,
            'selectedRestaurantId' => $menuItem->restaurant_id
        ]);
    }

    public function webUpdateMenuItem(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:100',
            'image' => 'nullable|string|max:2048',
            'image_file' => 'nullable|image|max:4096',
            'is_available' => 'nullable|boolean',
            'is_popular' => 'nullable|boolean',
            'is_veg' => 'nullable|boolean',
            'is_spicy' => 'nullable|boolean',
        ]);

        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        $menuItem = MenuItem::where('id', $id)
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->firstOrFail();

        $imageValue = $request->string('image')->toString() ?: $menuItem->image;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('menu-items', 'public');
            $imageValue = Storage::url($path);
        }

        $menuItem->update([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'category' => $request->category,
            'image' => $imageValue,
            'is_available' => $request->has('is_available'),
            'is_popular' => $request->has('is_popular'),
            'is_veg' => $request->has('is_veg'),
            'is_spicy' => $request->has('is_spicy'),
        ]);

        return redirect()->route('restaurant.menu')->with('success', 'Article mis à jour');
    }

    public function webDeleteMenuItem($id)
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        $menuItem = MenuItem::where('id', $id)
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->firstOrFail();

        $menuItem->delete();

        return back()->with('success', 'Article supprimé');
    }

    public function webOrders()
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        if ($restaurants->isEmpty()) {
            return redirect()->route('restaurant.setup')
                ->with('error', 'Créez d’abord un établissement pour voir les commandes.');
        }

        $selectedRestaurantId = session('selected_restaurant_id', $restaurants->first()->id);

        if (! $selectedRestaurantId) {
            return redirect()->route('restaurant.setup');
        }

        $restaurant = Restaurant::findOrFail($selectedRestaurantId);

        $orders = Order::where('restaurant_id', $restaurant->id)
            ->with(['user', 'items', 'driver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('restaurant.orders', compact('orders', 'restaurant', 'restaurants'));
    }

    public function webOrderShow($id)
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        $order = Order::with([
            'user',
            'restaurant',
            'address',
            'driver',
            'items.menuItem',
        ])
            ->where('id', $id)
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->firstOrFail();

        return view('restaurant.order-show', compact('order', 'restaurants'));
    }

    public function webOrderInvoice($id)
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        $order = Order::with(['user', 'restaurant', 'items.menuItem'])
            ->where('id', $id)
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->firstOrFail();

        $payment = OrderPayment::summary($order);

        return view('orders.invoice', compact('order', 'payment'));
    }

    public function validateOrder($id)
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        $order = Order::where('id', $id)
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->where('status', 'pending')
            ->firstOrFail();

        $order->status = 'preparing';
        if (empty($order->preparing_at)) $order->preparing_at = now();
        $order->save();

        return back()->with('success', 'Commande acceptée et en préparation');
    }

    public function rejectOrder($id)
    {
        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        $order = Order::where('id', $id)
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->where('status', 'pending')
            ->firstOrFail();

        $order->status = 'cancelled';
        if (empty($order->cancelled_at)) $order->cancelled_at = now();
        $order->save();

        try {
            $order->loadMissing(['user', 'restaurant']);
            $title = 'Mise à jour de commande';
            $body = 'Votre commande a été annulée.';
            if ($order->restaurant) {
                $body = ($order->restaurant->name ?? 'Restaurant').' · '.$body;
            }
            NotificationController::sendExpoPush(
                optional($order->user)->expo_push_token,
                $title,
                $body,
                ['type' => 'order_status', 'order_id' => $order->id, 'status' => 'cancelled']
            );
        } catch (\Throwable $e) {
            // ignore
        }

        return back()->with('success', 'Commande annulée');
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,picked_up,delivering,delivered,cancelled',
        ]);

        $user = Auth::user();
        $restaurants = Restaurant::where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhere('user_id', $user->id);
        })->get();

        $order = Order::where('id', $id)
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->firstOrFail();

        if ($validated['status'] === 'cancelled') {
            if (in_array($order->status, ['delivered', 'cancelled'], true)) {
                return back()->with('error', 'Impossible d’annuler une commande déjà livrée ou annulée.');
            }
        }

        $order->status = $validated['status'];
        if ($validated['status'] === 'preparing' && empty($order->preparing_at)) $order->preparing_at = now();
        if ($validated['status'] === 'picked_up' && empty($order->picked_up_at)) $order->picked_up_at = now();
        if ($validated['status'] === 'delivering' && empty($order->delivering_at)) $order->delivering_at = now();
        if ($validated['status'] === 'delivered' && empty($order->delivered_at)) $order->delivered_at = now();
        if ($validated['status'] === 'cancelled' && empty($order->cancelled_at)) $order->cancelled_at = now();
        if ($validated['status'] === 'delivered') {
            OrderPayment::markCashCollected($order);
        }
        OrderPayment::syncPaidAt($order);
        $order->save();

        // Notify customer (best-effort)
        try {
            $order->loadMissing(['user', 'restaurant']);
            $title = 'Mise à jour de commande';
            $body = $validated['status'] === 'cancelled'
                ? 'Votre commande a été annulée.'
                : 'Votre commande est maintenant: '.$validated['status'];
            if ($order->restaurant) {
                $body = ($order->restaurant->name ?? 'Restaurant').' · '.$body;
            }
            NotificationController::sendExpoPush(
                optional($order->user)->expo_push_token,
                $title,
                $body,
                ['type' => 'order_status', 'order_id' => $order->id, 'status' => $validated['status']]
            );
        } catch (\Throwable $e) {
            // ignore
        }

        return back()->with('success', $validated['status'] === 'cancelled' ? 'Commande annulée' : 'Statut mis à jour');
    }
}
