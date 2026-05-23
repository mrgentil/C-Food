<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AppTabController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\OrderMessageController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\AdminPromoCodeController;
use App\Http\Controllers\Api\PassController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\DriverMessageController;
use App\Http\Controllers\Api\DriverProfileController;
use App\Http\Controllers\Api\DriverHistoryController;
use App\Http\Controllers\Api\DriverWalletController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Test route
Route::get('/test', function () {
    return response()->json([
        'message' => 'C-Food API is running!',
        'timestamp' => now(),
    ]);
});

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::get('/app-tabs', [AppTabController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}/restaurants', [CategoryController::class, 'restaurants']);

Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/featured', [RestaurantController::class, 'featured']);
Route::get('/restaurants/search', [RestaurantController::class, 'search']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{id}/menu', [RestaurantController::class, 'menu']);

// Promo codes (public: visible without login)
Route::get('/promos', [PromoCodeController::class, 'index']);
Route::post('/promos/validate', [PromoCodeController::class, 'validateCode']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Broadcast::routes();

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // CFoodPass (DashPass legacy fields)
    Route::get('/pass', [PassController::class, 'status']);
    Route::post('/pass/subscribe', [PassController::class, 'subscribe']);
    Route::post('/pass/cancel', [PassController::class, 'cancel']);

    // Push notifications
    Route::post('/notifications/push-token', [NotificationController::class, 'registerPushToken']);

    // Driver app
    Route::middleware('is_driver')->prefix('driver')->group(function () {
        Route::get('/orders', [DriverController::class, 'orders']); // ?mode=available|mine|all&latitude=&longitude=
        Route::get('/orders/{id}', [DriverController::class, 'show']);
        Route::post('/orders/{id}/accept', [DriverController::class, 'accept']);
        Route::post('/orders/{id}/status', [DriverController::class, 'updateStatus']);
        Route::post('/orders/{id}/location', [DriverController::class, 'updateLocation']);

        // Profile & stats
        Route::get('/profile', [DriverProfileController::class, 'show']);
        Route::put('/profile', [DriverProfileController::class, 'update']);
        Route::get('/history', [DriverHistoryController::class, 'index']);
        Route::get('/wallet', [DriverWalletController::class, 'summary']);

        // Chat (driver <-> customer) scoped to driver's assigned orders
        Route::get('/orders/{id}/messages', [DriverMessageController::class, 'index']);
        Route::post('/orders/{id}/messages', [DriverMessageController::class, 'store']);
    });

    // Admin (protected)
    Route::middleware('is_admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::get('/orders/{id}', [AdminController::class, 'orderShow']);
        Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/restaurants', [AdminController::class, 'restaurants']);

        // Promo codes management
        Route::get('/promos', [AdminPromoCodeController::class, 'index']);
        Route::post('/promos', [AdminPromoCodeController::class, 'store']);
        Route::patch('/promos/{promo}', [AdminPromoCodeController::class, 'update']);
        Route::delete('/promos/{promo}', [AdminPromoCodeController::class, 'destroy']);
    });

    // Orders
    Route::post('/quote', [QuoteController::class, 'quote']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{id}/reorder', [OrderController::class, 'reorder']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/orders/{id}/track', [OrderController::class, 'track']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{id}/rate', [OrderController::class, 'rate']);
    Route::get('/orders/{id}/messages', [OrderMessageController::class, 'index']);
    Route::post('/orders/{id}/messages', [OrderMessageController::class, 'store']);

    // User profile
    Route::put('/profile', [AuthController::class, 'update']);
    Route::post('/profile/photo', [AuthController::class, 'updatePhoto']);

    // Addresses
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::put('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);
    Route::get('/favorites/check/{restaurantId}', [FavoriteController::class, 'check']);

    // Payments (simulation / gateway-ready)
    Route::post('/payments/process', [PaymentController::class, 'process']);

    // Promo codes: moved to public routes (see above)
});
