<?php

namespace App\Http\Controllers;

use App\Enums\InstanciaStatus;
use App\Models\Sorteo;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function index()
    {
        $sorteo = Sorteo::where('is_active', true)->first();
        $instancia = null;

        if ($sorteo) {
            $instancia = $sorteo->instancias()
                ->where('estado', '!=', InstanciaStatus::Finalizada)
                ->orderBy('fecha_ejecucion', 'asc')
                ->orderBy('id', 'asc')
                ->first();
        }

        return Inertia::render('welcome/welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'instanciaSorteoId' => $instancia ? $instancia->id : null,
            'sorteoNombre' => $sorteo ? $sorteo->nombre : null,
            'instanciaNombre' => $instancia ? $instancia->nombre : null,
        ]);
    }
}
