<?php

namespace App\Http\Controllers;

use App\Actions\Instancia\AddPremioToInstancia;
use App\Actions\Instancia\RemovePremioFromInstancia;
use App\Actions\Participantes\CleanParticipantesAction;
use App\Actions\Sorteo\ExecuteSorteoAction;
use App\Actions\Sorteo\StoreInstanciaSorteo;
use App\Actions\Premios\GetAllPremios;
use App\Http\Requests\Instancia\AddPremioRequest;
use App\Http\Requests\Instancia\RemovePremioRequest;
use App\Http\Resources\InstanciaSorteoResource;
use App\Http\Resources\Premios\PremioResource;
use App\Models\InstanciaSorteo;
use App\Models\Sorteo;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class InstanciaSorteoController extends Controller
{
    public function show(InstanciaSorteo $instancia): Response
    {
        $instancia->load(['sorteo', 'ganadores.premioInstancia.premio', 'ganadores.inscripto', 'ganadores.entregaPremio', 'premiosInstancia.premio']);
        
        // Count participants ready for raffle
        $participantsCount = $instancia->participantesSorteo()->count();

        // Get all available prizes for the dropdown
        $premios = GetAllPremios::execute([
            'page' => 1,
            'per_page' => 100,
            'sort' => 'nombre',
            'direction' => 'asc',
        ]);

        return Inertia::render('sorteo/instancia', [
            'instancia' => (new InstanciaSorteoResource($instancia))->resolve(),
            'sorteo' => (new \App\Http\Resources\SorteoResource($instancia->sorteo))->resolve(),
            'participantsCount' => $participantsCount,
            'ganadores' => $instancia->ganadores, // TODO: Use resource
            'premios' => PremioResource::collection($premios)->resolve(),
        ]);
    }

    public function addPremio(AddPremioRequest $request, InstanciaSorteo $instancia): RedirectResponse
    {
        $data = $request->validated();
        
        try {
            AddPremioToInstancia::execute($instancia, (int) $data['premio_id'], (int) $data['posicion'], (int) ($data['cantidad'] ?? 1));
            return redirect()->back()->with('status', 'Premio asignado a la instancia correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function removePremio(RemovePremioRequest $request, InstanciaSorteo $instancia): RedirectResponse
    {
        $data = $request->validated();

        try {
            RemovePremioFromInstancia::execute($instancia, (int) $data['premio_id'], (int) $data['posicion']);
            return redirect()->back()->with('status', 'Premio eliminado de la instancia.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
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
