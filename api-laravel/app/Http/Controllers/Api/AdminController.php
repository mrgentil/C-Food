<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller as BaseController;
use App\Models\Order;
use App\Events\OrderAvailable;
use App\Models\User;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\NotificationController;
use App\Support\DriverVerification;
use App\Support\OrderPayment;
use App\Support\DriverVerificationNotifier;
use App\Support\AdminHtmx;
use Illuminate\Support\Facades\Storage;

class AdminController extends BaseController
{
    // ==================== API METHODS ====================
    
    public function dashboard()
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();

        $totalOrders = Order::count();
        $pendingOrders = Order::whereIn('status', ['pending', 'preparing', 'picked_up', 'delivering'])->count();
        $totalUsers = User::count();
        $totalRestaurants = Restaurant::count();

        $revenueToday = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $today)
            ->sum('total');

        $revenueMonth = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $monthStart)
            ->sum('total');

        $recentOrders = Order::with(['user:id,name', 'restaurant:id,name'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => [
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'total_users' => $totalUsers,
                'total_restaurants' => $totalRestaurants,
                'revenue_today' => $revenueToday,
                'revenue_month' => $revenueMonth,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }

    public function orders()
    {
        $orders = Order::with(['user', 'restaurant', 'items'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $orders]);
    }

    public function orderShow($id)
    {
        $order = Order::with(['user', 'restaurant', 'items'])->findOrFail($id);

        return response()->json([
            'data' => $order,
        ]);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,picked_up,delivering,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
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

        if ($validated['status'] === 'preparing' && empty($order->driver_id)) {
            broadcast(new OrderAvailable($order));
        }

        // Notify customer (best-effort)
        try {
            $order->loadMissing(['user', 'restaurant']);
            $title = 'Mise à jour de commande';
            $body = 'Votre commande est maintenant: '.$validated['status'];
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

        return response()->json([
            'message' => 'Statut mis à jour',
            'data' => $order,
        ]);
    }

    public function users()
    {
        $users = User::withCount(['orders'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $users]);
    }

    public function restaurants()
    {
        $restaurants = Restaurant::withCount(['orders', 'menuItems'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['data' => $restaurants]);
    }

    // ==================== WEB METHODS ====================

    public function webDashboard()
    {
        $stats = [
            'orders_count' => Order::count(),
            'users_count' => User::count(),
            'restaurants_count' => Restaurant::count(),
            'revenue' => Order::where('status', '!=', 'cancelled')->sum('total'),
        ];

        $recentOrders = Order::with(['user', 'restaurant'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // 1. Revenue last 30 days
        $thirtyDaysAgo = Carbon::today()->subDays(29);
        $dailyRevenue = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('DATE(created_at) as date, SUM(total) as daily_total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');
            
        $revenueDates = [];
        $revenueValues = [];
        for ($i = 0; $i < 30; $i++) {
            $date = (clone $thirtyDaysAgo)->addDays($i)->format('Y-m-d');
            $revenueDates[] = Carbon::parse($date)->format('d M');
            $revenueValues[] = isset($dailyRevenue[$date]) ? (float) $dailyRevenue[$date]->daily_total : 0;
        }
        $chartRevenue = ['labels' => $revenueDates, 'data' => $revenueValues];

        // 2. Orders by Status
        $statusCounts = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
        
        $statusColors = [
            'pending' => '#f59e0b',    // yellow-500
            'preparing' => '#3b82f6',  // blue-500
            'picked_up' => '#8b5cf6',  // violet-500
            'delivering' => '#06b6d4', // cyan-500
            'delivered' => '#10b981',  // green-500
            'cancelled' => '#ef4444'   // red-500
        ];
        
        $chartStatus = [
            'labels' => array_map('ucfirst', array_keys($statusCounts)),
            'data' => array_values($statusCounts),
            'colors' => array_map(fn($status) => $statusColors[$status] ?? '#6b7280', array_keys($statusCounts))
        ];

        // 3. Top 5 Restaurants
        $topRestaurants = Restaurant::withCount('orders')
            ->orderByDesc('orders_count')
            ->limit(5)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentOrders', 'chartRevenue', 'chartStatus', 'topRestaurants'));
    }

    public function webOrders()
    {
        $status = request()->string('status')->toString();
        $q = trim((string) request()->string('q'));
        $perPage = (int) (request()->integer('per_page') ?: 20);
        if ($perPage < 5) $perPage = 5;
        if ($perPage > 100) $perPage = 100;

        $ordersQuery = Order::with(['user', 'restaurant', 'driver'])
            ->orderBy('created_at', 'desc');

        if (!empty($status)) {
            $ordersQuery->where('status', $status);
        }

        if (!empty($q)) {
            $ordersQuery->where(function ($qq) use ($q) {
                $qq->where('id', 'like', '%'.$q.'%')
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', '%'.$q.'%')->orWhere('email', 'like', '%'.$q.'%'))
                    ->orWhereHas('restaurant', fn ($r) => $r->where('name', 'like', '%'.$q.'%'));
            });
        }

        $orders = $ordersQuery->paginate($perPage)->withQueryString();

        return AdminHtmx::list(request(), 'admin.orders', 'admin.partials.orders-list', compact('orders'));
    }

    public function webOrderShow($id)
    {
        $order = Order::with([
            'user',
            'restaurant',
            'address',
            'driver',
            'items.menuItem',
        ])->findOrFail($id);

        return view('admin.order-show', compact('order'));
    }

    public function webOrderInvoice($id)
    {
        $order = Order::with(['user', 'restaurant', 'items.menuItem'])->findOrFail($id);
        $payment = OrderPayment::summary($order);

        return view('orders.invoice', compact('order', 'payment'));
    }

    public function webUpdateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,picked_up,delivering,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);

        if ($validated['status'] === 'cancelled' && $order->status === 'cancelled') {
            return back()->with('error', 'Cette commande est déjà annulée.');
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

    public function webUsers()
    {
        $role = request()->string('role')->toString(); // admin|merchant|driver|client
        $q = trim((string) request()->string('q'));
        $perPage = (int) (request()->integer('per_page') ?: 20);
        if ($perPage < 5) $perPage = 5;
        if ($perPage > 100) $perPage = 100;

        $usersQuery = User::withCount(['orders', 'stores'])
            ->orderBy('created_at', 'desc');

        if (!empty($q)) {
            $usersQuery->where(function ($qq) use ($q) {
                $qq->where('name', 'like', '%'.$q.'%')
                    ->orWhere('email', 'like', '%'.$q.'%')
                    ->orWhere('phone', 'like', '%'.$q.'%');
            });
        }

        if ($role === 'admin') {
            $usersQuery->where('is_admin', true);
        } elseif ($role === 'merchant') {
            $usersQuery->where(function ($qq) {
                $qq->where('is_merchant', true)->orWhere('is_restaurant', true);
            });
        } elseif ($role === 'driver') {
            $usersQuery->where('is_driver', true);
        } elseif ($role === 'client') {
            $usersQuery->where('is_admin', false)
                ->where('is_driver', false)
                ->where(function ($qq) {
                    $qq->where('is_merchant', false)->where('is_restaurant', false);
                });
        }

        $users = $usersQuery->paginate($perPage)->withQueryString();

        return AdminHtmx::list(request(), 'admin.users', 'admin.partials.users-list', compact('users'));
    }

    public function webUserToggleSuspend(Request $request, User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Vous ne pouvez pas suspendre votre propre compte.');
        }

        $shouldCloseStores = $request->boolean('close_stores', true);

        DB::beginTransaction();
        try {
            $isSuspended = !empty($user->suspended_at);
            $user->update([
                'suspended_at' => $isSuspended ? null : now(),
            ]);

            $isMerchant = (bool) ($user->is_merchant || $user->is_restaurant);
            if (!$isSuspended && $isMerchant && $shouldCloseStores) {
                Restaurant::where('owner_user_id', $user->id)->update(['is_open' => false]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur: '.$e->getMessage());
        }

        return back()->with('success', !empty($user->suspended_at) ? 'Compte suspendu.' : 'Compte réactivé.');
    }

    public function webRestaurants()
    {
        $type = request()->string('type')->toString();
        $open = request()->string('open')->toString(); // 1|0|''
        $ownerUserId = request()->string('owner_user_id')->toString();
        $q = trim((string) request()->string('q'));
        $perPage = (int) (request()->integer('per_page') ?: 20);
        if ($perPage < 5) $perPage = 5;
        if ($perPage > 100) $perPage = 100;

        $restaurantsQuery = Restaurant::withCount(['orders', 'menuItems'])
            ->with(['owner:id,name,email'])
            ->orderBy('created_at', 'desc');

        if (!empty($q)) {
            $restaurantsQuery->where('name', 'like', '%'.$q.'%');
        }
        if (!empty($type)) {
            $restaurantsQuery->where('type', $type);
        }
        if ($open === '1') {
            $restaurantsQuery->where('is_open', true);
        } elseif ($open === '0') {
            $restaurantsQuery->where('is_open', false);
        }
        if (!empty($ownerUserId)) {
            $restaurantsQuery->where('owner_user_id', $ownerUserId);
        }

        $restaurants = $restaurantsQuery->paginate($perPage)->withQueryString();

        return AdminHtmx::list(request(), 'admin.restaurants', 'admin.partials.restaurants-list', compact('restaurants'));
    }

    public function webUserCreate()
    {
        return view('admin.user-form', ['user' => null]);
    }

    public function webUserStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $isDriver = $request->boolean('roles_driver');

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_admin' => $request->boolean('roles_admin'),
            'is_restaurant' => $request->boolean('roles_restaurant'),
            'is_driver' => $isDriver,
            'driver_verification_status' => $isDriver ? DriverVerification::STATUS_PENDING : null,
        ]);

        return redirect()->route('admin.users')->with('success', 'Utilisateur créé.');
    }

    public function webUserEdit(User $user)
    {
        $user->refresh();

        $driverStats = null;
        if ($user->is_driver) {
            $deliveredQ = Order::query()
                ->where('driver_id', $user->id)
                ->where('status', 'delivered');
            $driverStats = [
                'delivered_count' => (int) (clone $deliveredQ)->count(),
                'cancelled_count' => (int) Order::query()
                    ->where('driver_id', $user->id)
                    ->where('status', 'cancelled')
                    ->count(),
                'commission_total' => \App\Support\DriverCommission::forOrderTotal((int) $deliveredQ->sum('total')),
            ];
        }

        return view('admin.user-form', compact('user', 'driverStats'));
    }

    public function webUserUpdate(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $isDriver = $request->boolean('roles_driver');

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'is_admin' => $request->boolean('roles_admin'),
            'is_restaurant' => $request->boolean('roles_restaurant'),
            'is_driver' => $isDriver,
        ];

        if ($isDriver && empty($user->driver_verification_status)) {
            $data['driver_verification_status'] = DriverVerification::STATUS_PENDING;
        }
        if (! $isDriver) {
            $data['is_online'] = false;
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('admin.users')->with('success', 'Utilisateur mis à jour.');
    }

    public function webUserResetPassword(Request $request, User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Vous ne pouvez pas réinitialiser votre propre mot de passe ici.');
        }

        $validated = $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return back()->with('success', 'Mot de passe réinitialisé.');
    }

    public function webUserDestroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        try {
            $user->delete();
        } catch (\Throwable $e) {
            return back()->with('error', 'Suppression impossible : données liées (commandes, restaurants, etc.).');
        }

        return redirect()->route('admin.users')->with('success', 'Utilisateur supprimé.');
    }

    public function webDriverVerification(Request $request, User $user)
    {
        if (! $user->is_driver) {
            return back()->with('error', 'Cet utilisateur n\'est pas un livreur.');
        }

        $validated = $request->validate([
            'action' => 'required|in:save,approve,reject',
            'driver_verification_note' => 'nullable|string|max:1000',
            'driver_license_url' => 'nullable|string|max:2048',
            'driver_insurance_url' => 'nullable|string|max:2048',
            'driver_id_url' => 'nullable|string|max:2048',
            'license_file' => 'nullable|image|max:5120',
            'insurance_file' => 'nullable|image|max:5120',
            'id_file' => 'nullable|image|max:5120',
        ]);

        $this->applyDriverDocumentField($user, $request, 'license_file', 'driver_license_url', $validated);
        $this->applyDriverDocumentField($user, $request, 'insurance_file', 'driver_insurance_url', $validated);
        $this->applyDriverDocumentField($user, $request, 'id_file', 'driver_id_url', $validated);

        if ($validated['action'] === 'approve') {
            if (! DriverVerification::hasRequiredDocuments($user)) {
                return back()->with('error', 'Permis et assurance requis avant approbation.');
            }
            $user->driver_verification_status = DriverVerification::STATUS_APPROVED;
            $user->driver_verified_at = now();
            $user->driver_verified_by = Auth::id();
            $user->driver_verification_note = $validated['driver_verification_note'] ?? null;
        } elseif ($validated['action'] === 'reject') {
            $user->driver_verification_status = DriverVerification::STATUS_REJECTED;
            $user->driver_verified_at = null;
            $user->driver_verified_by = Auth::id();
            $user->driver_verification_note = $validated['driver_verification_note']
                ?? 'Dossier refusé. Merci de corriger vos documents.';
            $user->is_online = false;
        } else {
            if (array_key_exists('driver_verification_note', $validated)) {
                $user->driver_verification_note = $validated['driver_verification_note'];
            }
        }

        $user->save();

        if (in_array($validated['action'], ['approve', 'reject'], true)) {
            DriverVerificationNotifier::notifyStatusChange($user->fresh());
        }

        $msg = match ($validated['action']) {
            'approve' => 'Livreur vérifié et approuvé. Notification envoyée.',
            'reject' => 'Dossier livreur refusé. Notification envoyée.',
            default => 'Documents livreur enregistrés.',
        };

        return redirect()
            ->route('admin.users.edit', $user)
            ->with('success', $msg)
            ->withFragment('driver-verification');
    }

    private function applyDriverDocumentField(
        User $user,
        Request $request,
        string $fileKey,
        string $urlColumn,
        array $validated
    ): void {
        if ($request->hasFile($fileKey)) {
            $stored = $request->file($fileKey)->store('driver-documents/'.$user->id, 'public');
            $user->{$urlColumn} = asset('storage/'.$stored);

            return;
        }

        if ($request->filled($urlColumn)) {
            $user->{$urlColumn} = trim((string) $validated[$urlColumn]);
        }
    }
}
