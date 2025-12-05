<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ParticipantesController;
use App\Http\Controllers\SorteoController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

// API pública para realizar sorteo (sin CSRF)
Route::post('/api/sorteo/realizar', [SorteoController::class, 'realizar'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
    ->name('api.sorteo.realizar');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    // Sorteos
    Route::get('sorteo', [SorteoController::class, 'index'])->name('sorteo');
    Route::post('sorteo', [SorteoController::class, 'store'])->name('sorteo.store');
    Route::get('sorteo/list', [SorteoController::class, 'list'])->name('sorteo.list');
    Route::post('sorteo/resetear-ganadores', [SorteoController::class, 'resetearGanadores'])->name('sorteo.resetear');

    // Participantes
    Route::get('participantes', [ParticipantesController::class, 'index'])->name('participantes');
    Route::post('participantes/import', [ParticipantesController::class, 'import'])->name('participantes.import');
    Route::get('participantes/list', [ParticipantesController::class, 'list'])->name('participantes.list');
});

require __DIR__ . '/settings.php';
