<?php

namespace App\Http\Controllers;

use App\Actions\Participantes\CleanParticipantesAction;
use App\Actions\Sorteo\ExecuteSorteoAction;
use App\Actions\Sorteo\StoreInstanciaSorteo;
use App\Http\Resources\InstanciaSorteoResource;
use App\Models\InstanciaSorteo;
use App\Models\Sorteo;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InstanciaSorteoController extends Controller
{
    public function show(InstanciaSorteo $instancia): Response
    {
        $instancia->load(['sorteo', 'ganadores.premio', 'ganadores.participante']);
        
        // Count participants ready for raffle
        $participantsCount = $instancia->participantesSorteo()->count();

        return Inertia::render('sorteo/instancia', [
            'instancia' => new InstanciaSorteoResource($instancia),
            'sorteo' => new \App\Http\Resources\SorteoResource($instancia->sorteo),
            'participantsCount' => $participantsCount,
            'ganadores' => $instancia->ganadores, // TODO: Use resource
        ]);
    }

    public function store(Request $request, Sorteo $sorteo): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'fecha_ejecucion' => ['required', 'date'],
        ]);

        StoreInstanciaSorteo::execute([
            'sorteo_id' => $sorteo->id,
            'nombre' => $validated['nombre'],
            'fecha_ejecucion' => $validated['fecha_ejecucion'],
        ]);

        return redirect()->back()->with('status', 'Instancia creada correctamente.');
    }

    public function clean(InstanciaSorteo $instancia): RedirectResponse
    {
        try {
            $result = CleanParticipantesAction::execute($instancia->id);
            return redirect()->back()->with('status', $result['message']);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al limpiar participantes: ' . $e->getMessage()]);
        }
    }

    public function execute(InstanciaSorteo $instancia): RedirectResponse
    {
        try {
            $result = ExecuteSorteoAction::execute($instancia->id);
            return redirect()->back()->with('status', 'Sorteo ejecutado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al ejecutar sorteo: ' . $e->getMessage()]);
        }
    }
}
