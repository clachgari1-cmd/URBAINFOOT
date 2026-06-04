<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PartnerAuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PitchController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\BookingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Client Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Partner Auth Routes
Route::post('/partner/register', [PartnerAuthController::class, 'register']);
Route::post('/partner/login', [PartnerAuthController::class, 'login']);

// Protected Client Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Products (Client views)
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);

    // Pitches (Client views)
    Route::get('/pitches', [PitchController::class, 'index']);
    Route::get('/pitches/{pitch}', [PitchController::class, 'show']);
    Route::get('/pitches/{pitch}/slots', [BookingController::class, 'bookedSlots']);

    // Orders (Client management)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Bookings (Client management)
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
});

// Protected Partner Routes
Route::middleware(['auth:sanctum', 'ability:partner-token'])->group(function () {
    Route::get('/partner', function (Request $request) {
        return $request->user();
    });
    Route::post('/partner/logout', [PartnerAuthController::class, 'logout']);

    // Product CRUD (Brand Admins)
    Route::get('/partner/products', [ProductController::class, 'partnerProducts']);
    Route::post('/partner/products', [ProductController::class, 'store']);
    Route::match(['put', 'patch'], '/partner/products/{product}', [ProductController::class, 'update']);
    Route::delete('/partner/products/{product}', [ProductController::class, 'destroy']);

    // Pitch CRUD (Pitch Managers)
    Route::get('/partner/pitches', [PitchController::class, 'partnerPitches']);
    Route::post('/partner/pitches', [PitchController::class, 'store']);
    Route::match(['put', 'patch'], '/partner/pitches/{pitch}', [PitchController::class, 'update']);
    Route::delete('/partner/pitches/{pitch}', [PitchController::class, 'destroy']);

    // Orders Dashboard (Brand Admins)
    Route::get('/partner/orders', [OrderController::class, 'partnerOrders']);
    Route::patch('/partner/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Bookings Dashboard (Pitch Managers)
    Route::get('/partner/bookings', [BookingController::class, 'partnerBookings']);
    Route::patch('/partner/bookings/{id}/status', [BookingController::class, 'updateStatus']);
});
