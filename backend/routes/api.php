<?php

declare(strict_types=1);

use App\Http\Controllers\Api\FinancialController;
use App\Http\Controllers\Api\FinancialRouteController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReadController;
use App\Http\Controllers\Api\BasicOperationsController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\RecurrenceController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:auth')->post('/auth/login', [AuthController::class, 'login']);
Route::middleware('throttle:auth')->post('/auth/register', [AuthController::class, 'register']);
Route::middleware('throttle:auth')->post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::middleware('throttle:auth')->post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/cards', [ReadController::class, 'cards']);
    Route::get('/cards/{card}', [ReadController::class, 'card']);
    Route::get('/invoices', [ReadController::class, 'invoices']);
    Route::get('/operations', [ReadController::class, 'operations']);
    Route::get('/financial-route', [FinancialRouteController::class, 'index']);
    Route::get('/accounts', [BasicOperationsController::class, 'accounts']);
    Route::post('/accounts', [BasicOperationsController::class, 'storeAccount']);
    Route::get('/categories', [BasicOperationsController::class, 'categories']);
    Route::post('/categories', [BasicOperationsController::class, 'storeCategory']);
    Route::post('/expenses', [BasicOperationsController::class, 'store'])->defaults('nature', 'EXPENSE');
    Route::post('/incomes', [BasicOperationsController::class, 'store'])->defaults('nature', 'INCOME');
    Route::post('/operations/{operation}/confirm', [BasicOperationsController::class, 'confirm']);
    Route::post('/transfers', [TransferController::class, 'store']);
    Route::post('/operations/{operation}/transfer-legs/{leg}/confirm', [TransferController::class, 'confirm']);
    Route::post('/recurrences', [RecurrenceController::class, 'store']);
    Route::get('/recurrences', [RecurrenceController::class, 'index']);
    Route::post('/recurrences/{schedule}/generate', [RecurrenceController::class, 'generate']);
    Route::get('/recurrences/{schedule}/occurrences', [RecurrenceController::class, 'occurrences']);
    Route::post('/recurrence-occurrences/{occurrence}/materialize', [RecurrenceController::class, 'materialize']);
    Route::patch('/recurrence-occurrences/{occurrence}', [RecurrenceController::class, 'update']);
    Route::patch('/recurrence-occurrences/{occurrence}/and-following', [RecurrenceController::class, 'updateAndFollowing']);
    Route::post('/recurrence-occurrences/{occurrence}/cancel', [RecurrenceController::class, 'cancel']);
    Route::post('/cards/{card}/opening-balance', [FinancialController::class, 'openingBalance']);
    Route::post('/purchases', [FinancialController::class, 'purchase']);
    Route::post('/operations/{payment}/payment-allocations', [FinancialController::class, 'allocatePayment']);
    Route::post('/payment-allocations/{allocation}/reversals', [FinancialController::class, 'reversePayment']);
});
