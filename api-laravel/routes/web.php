<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\PromoCodeWebController;
use App\Http\Controllers\AdminCategoryWebController;
use App\Http\Controllers\AdminRestaurantWebController;
use App\Http\Controllers\AdminMenuCategoryWebController;
use App\Http\Controllers\AdminMenuItemWebController;
use App\Http\Controllers\AdminAppTabWebController;
use App\Http\Controllers\MerchantPromoWebController;
use App\Http\Controllers\AdminSettingWebController;

// Auth routes
Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'webLogin']);
Route::post('/logout', [AuthController::class, 'webLogout'])->name('logout');

// Admin routes (is_admin = true)
Route::middleware(['auth', 'is_admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'webDashboard'])->name('admin.dashboard');
    Route::get('/orders', [AdminController::class, 'webOrders'])->name('admin.orders');
    Route::get('/orders/{id}', [AdminController::class, 'webOrderShow'])->name('admin.orders.show');
    Route::get('/orders/{id}/invoice', [AdminController::class, 'webOrderInvoice'])->name('admin.orders.invoice');
    Route::post('/orders/{id}/status', [AdminController::class, 'webUpdateOrderStatus'])->name('admin.orders.updateStatus');
    Route::get('/users', [AdminController::class, 'webUsers'])->name('admin.users');
    Route::get('/users/create', [AdminController::class, 'webUserCreate'])->name('admin.users.create');
    Route::post('/users', [AdminController::class, 'webUserStore'])->name('admin.users.store');
    Route::get('/users/{user}/edit', [AdminController::class, 'webUserEdit'])->name('admin.users.edit');
    Route::put('/users/{user}', [AdminController::class, 'webUserUpdate'])->name('admin.users.update');
    Route::post('/users/{user}/reset-password', [AdminController::class, 'webUserResetPassword'])->name('admin.users.resetPassword');
    Route::delete('/users/{user}', [AdminController::class, 'webUserDestroy'])->name('admin.users.destroy');
    Route::post('/users/{user}/toggle-suspend', [AdminController::class, 'webUserToggleSuspend'])->name('admin.users.toggleSuspend');
    Route::post('/users/{user}/driver-verification', [AdminController::class, 'webDriverVerification'])->name('admin.users.driverVerification');
    Route::get('/restaurants', [AdminController::class, 'webRestaurants'])->name('admin.restaurants');
    Route::get('/restaurants/create', [AdminRestaurantWebController::class, 'create'])->name('admin.restaurants.create');
    Route::post('/restaurants', [AdminRestaurantWebController::class, 'store'])->name('admin.restaurants.store');
    Route::get('/restaurants/{restaurant}/edit', [AdminRestaurantWebController::class, 'edit'])->name('admin.restaurants.edit');
    Route::put('/restaurants/{restaurant}', [AdminRestaurantWebController::class, 'update'])->name('admin.restaurants.update');
    Route::delete('/restaurants/{restaurant}', [AdminRestaurantWebController::class, 'destroy'])->name('admin.restaurants.destroy');

    // Promos
    Route::get('/promos', [PromoCodeWebController::class, 'index'])->name('admin.promos');
    Route::get('/promos/create', [PromoCodeWebController::class, 'create'])->name('admin.promos.create');
    Route::post('/promos', [PromoCodeWebController::class, 'store'])->name('admin.promos.store');
    Route::get('/promos/{promo}/edit', [PromoCodeWebController::class, 'edit'])->name('admin.promos.edit');
    Route::put('/promos/{promo}', [PromoCodeWebController::class, 'update'])->name('admin.promos.update');
    Route::delete('/promos/{promo}', [PromoCodeWebController::class, 'destroy'])->name('admin.promos.destroy');

    // Categories
    Route::get('/categories', [AdminCategoryWebController::class, 'index'])->name('admin.categories');
    Route::get('/categories/create', [AdminCategoryWebController::class, 'create'])->name('admin.categories.create');
    Route::post('/categories', [AdminCategoryWebController::class, 'store'])->name('admin.categories.store');
    Route::get('/categories/{category}/edit', [AdminCategoryWebController::class, 'edit'])->name('admin.categories.edit');
    Route::put('/categories/{category}', [AdminCategoryWebController::class, 'update'])->name('admin.categories.update');
    Route::delete('/categories/{category}', [AdminCategoryWebController::class, 'destroy'])->name('admin.categories.destroy');

    // Onglets app (Épicerie, Pharmacie…)
    Route::get('/app-tabs', [AdminAppTabWebController::class, 'index'])->name('admin.appTabs');
    Route::get('/app-tabs/create', [AdminAppTabWebController::class, 'create'])->name('admin.appTabs.create');
    Route::post('/app-tabs', [AdminAppTabWebController::class, 'store'])->name('admin.appTabs.store');
    Route::get('/app-tabs/{appTab}/edit', [AdminAppTabWebController::class, 'edit'])->name('admin.appTabs.edit');
    Route::put('/app-tabs/{appTab}', [AdminAppTabWebController::class, 'update'])->name('admin.appTabs.update');
    Route::delete('/app-tabs/{appTab}', [AdminAppTabWebController::class, 'destroy'])->name('admin.appTabs.destroy');
    Route::post('/app-tabs/{appTab}/toggle', [AdminAppTabWebController::class, 'togglePublish'])->name('admin.appTabs.toggle');

    // Menu (admin) - sections + items (for restaurants / grocery / pharmacy / etc)
    Route::get('/menu-categories', [AdminMenuCategoryWebController::class, 'index'])->name('admin.menuCategories');
    Route::get('/menu-categories/create', [AdminMenuCategoryWebController::class, 'create'])->name('admin.menuCategories.create');
    Route::post('/menu-categories', [AdminMenuCategoryWebController::class, 'store'])->name('admin.menuCategories.store');
    Route::get('/menu-categories/{menuCategory}/edit', [AdminMenuCategoryWebController::class, 'edit'])->name('admin.menuCategories.edit');
    Route::put('/menu-categories/{menuCategory}', [AdminMenuCategoryWebController::class, 'update'])->name('admin.menuCategories.update');
    Route::delete('/menu-categories/{menuCategory}', [AdminMenuCategoryWebController::class, 'destroy'])->name('admin.menuCategories.destroy');

    Route::get('/menu-items', [AdminMenuItemWebController::class, 'index'])->name('admin.menuItems');
    Route::get('/menu-items/create', [AdminMenuItemWebController::class, 'create'])->name('admin.menuItems.create');
    Route::post('/menu-items', [AdminMenuItemWebController::class, 'store'])->name('admin.menuItems.store');
    Route::get('/menu-items/{menuItem}/edit', [AdminMenuItemWebController::class, 'edit'])->name('admin.menuItems.edit');
    Route::put('/menu-items/{menuItem}', [AdminMenuItemWebController::class, 'update'])->name('admin.menuItems.update');
    Route::delete('/menu-items/{menuItem}', [AdminMenuItemWebController::class, 'destroy'])->name('admin.menuItems.destroy');

    // Settings (global)
    Route::get('/settings', [AdminSettingWebController::class, 'edit'])->name('admin.settings');
    Route::post('/settings', [AdminSettingWebController::class, 'update'])->name('admin.settings.update');
});

// Restaurant routes (is_restaurant = true)
Route::middleware(['auth', 'is_restaurant'])->prefix('restaurant')->group(function () {
    Route::get('/setup', [RestaurantController::class, 'webSetup'])->name('restaurant.setup');
    Route::post('/setup', [RestaurantController::class, 'webSaveSetup'])->name('restaurant.setup.save');
    Route::put('/stores/{id}', [RestaurantController::class, 'webUpdateStore'])->name('restaurant.stores.update');
    Route::post('/switch', [RestaurantController::class, 'switchRestaurant'])->name('restaurant.switch');
    Route::get('/dashboard', [RestaurantController::class, 'webDashboard'])->name('restaurant.dashboard');
    Route::get('/orders', [RestaurantController::class, 'webOrders'])->name('restaurant.orders');
    Route::get('/orders/{id}', [RestaurantController::class, 'webOrderShow'])->name('restaurant.orders.show');
    Route::get('/orders/{id}/invoice', [RestaurantController::class, 'webOrderInvoice'])->name('restaurant.orders.invoice');
    Route::get('/menu', [RestaurantController::class, 'webMenu'])->name('restaurant.menu');
    Route::get('/menu/create', [RestaurantController::class, 'webCreateMenuItem'])->name('restaurant.menu.create');
    Route::post('/menu', [RestaurantController::class, 'webStoreMenuItem'])->name('restaurant.menu.store');
    Route::get('/menu/{id}/edit', [RestaurantController::class, 'webEditMenuItem'])->name('restaurant.menu.edit');
    Route::put('/menu/{id}', [RestaurantController::class, 'webUpdateMenuItem'])->name('restaurant.menu.update');
    Route::delete('/menu/{id}', [RestaurantController::class, 'webDeleteMenuItem'])->name('restaurant.menu.delete');
    Route::post('/orders/{id}/validate', [RestaurantController::class, 'validateOrder'])->name('restaurant.orders.validate');
    Route::post('/orders/{id}/reject', [RestaurantController::class, 'rejectOrder'])->name('restaurant.orders.reject');
    Route::post('/orders/{id}/status', [RestaurantController::class, 'updateOrderStatus'])->name('restaurant.orders.status');

    // Promos (merchant scoped to their store)
    Route::get('/promos', [MerchantPromoWebController::class, 'index'])->name('restaurant.promos');
    Route::get('/promos/create', [MerchantPromoWebController::class, 'create'])->name('restaurant.promos.create');
    Route::post('/promos', [MerchantPromoWebController::class, 'store'])->name('restaurant.promos.store');
    Route::get('/promos/{promo}/edit', [MerchantPromoWebController::class, 'edit'])->name('restaurant.promos.edit');
    Route::put('/promos/{promo}', [MerchantPromoWebController::class, 'update'])->name('restaurant.promos.update');
    Route::delete('/promos/{promo}', [MerchantPromoWebController::class, 'destroy'])->name('restaurant.promos.destroy');
});

// Redirect root to login
Route::redirect('/', '/login');

// Public order tracking (no auth required)
Route::get('/track/{id}', [OrderController::class, 'webTrack'])->name('order.track');
