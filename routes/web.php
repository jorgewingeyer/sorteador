<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ParticipantesController;
use App\Http\Controllers\SorteoController;
use App\Http\Controllers\PremioController;
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
    Route::post('sorteo/{sorteo}/premios', [SorteoController::class, 'updatePremios'])->name('sorteo.updatePremios');
    Route::get('sorteo/{sorteo}', [SorteoController::class, 'show'])->name('sorteo.show');
    Route::post('sorteo/{sorteo}/premios/add', [SorteoController::class, 'addPremio'])->name('sorteo.premios.add');
    Route::delete('sorteo/{sorteo}/premios/remove', [SorteoController::class, 'removePremio'])->name('sorteo.premios.remove');
    Route::patch('sorteo/{sorteo}/premios/reorder', [SorteoController::class, 'reorderPremios'])->name('sorteo.premios.reorder');
    Route::post('sorteo/{sorteo}/toggle-status', [SorteoController::class, 'toggleStatus'])->name('sorteo.toggleStatus');

    // Premios
    Route::get('premios', [PremioController::class, 'index'])->name('premios');
    Route::post('premios', [PremioController::class, 'store'])->name('premios.store');

    // Participantes
    Route::get('participantes', [ParticipantesController::class, 'index'])->name('participantes');
    Route::post('participantes/import', [ParticipantesController::class, 'import'])->name('participantes.import');
    Route::get('participantes/list', [ParticipantesController::class, 'list'])->name('participantes.list');
});

require __DIR__ . '/settings.php';
