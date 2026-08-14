<?php

namespace App\Http\Controllers;

use App\Actions\Premios\GetAllPremios;
use App\Actions\Sorteo\AddPremioToSorteo;
use App\Actions\Sorteo\ExecuteSorteoAction;
use App\Actions\Sorteo\GetAllSorteos;
use App\Actions\Sorteo\RemovePremioFromSorteo;
use App\Actions\Sorteo\ResetearGanadores;
use App\Actions\Sorteo\StoreSorteo;
use App\Actions\Sorteo\ToggleSorteoStatus;
use App\Actions\Sorteo\UpdateSorteoPremios;
use App\Http\Requests\Sorteo\AddPremioRequest;
use App\Http\Requests\Sorteo\RemovePremioRequest;
use App\Http\Requests\Sorteo\ReorderPremiosRequest;
use App\Http\Requests\Sorteo\StoreRequest;
use App\Http\Requests\Sorteo\ToggleStatusRequest;
use App\Http\Requests\Sorteo\UpdatePremiosRequest;
use App\Http\Resources\Premios\PremioResource;
use App\Http\Resources\SorteoResource;
use App\Models\Sorteo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SorteoController extends Controller
{
    public function index(Request $request): Response
    {
        $response = GetAllSorteos::execute([
            'page' => 1,
            'per_page' => (int) $request->query('per_page', 10),
            'sort' => 'created_at',
            'direction' => 'desc',
        ]);
        $premios = GetAllPremios::execute([
            'page' => 1,
            'per_page' => 100,
            'sort' => 'nombre',
            'direction' => 'asc',
        ]);

        return Inertia::render('sorteo/sorteo', [
            'listSorteos' => $response->getData(true),
            'premios' => PremioResource::collection($premios)->response()->getData(true),
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        return GetAllSorteos::execute([
            'page' => (int) $request->query('page', 1),
            'per_page' => (int) $request->query('per_page', 15),
            'sort' => (string) $request->query('sort', 'created_at'),
            'direction' => (string) $request->query('direction', 'desc'),
            'nombre' => (string) $request->query('nombre', ''),
        ]);
    }

    public function show(Sorteo $sorteo): JsonResponse
    {
        return (new SorteoResource($sorteo->load('instancias')))
            ->additional(['status' => 'ok'])
            ->response();
    }

    public function store(StoreRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        $sorteo = StoreSorteo::execute($data);

        if ($request->expectsJson()) {
            return (new SorteoResource($sorteo))
                ->additional(['status' => 'ok'])
                ->response();
        }

        return redirect()->route('sorteo')
            ->with('status', 'Sorteo creado correctamente')
            ->with('created_sorteo_id', $sorteo->id);
    }

    /**
     * Realiza un sorteo aleatorio para una instancia específica.
     */
    public function realizar(Request $request): JsonResponse
    {
        try {
            $instanciaId = $request->input('instancia_sorteo_id');

            if (! $instanciaId || ! is_numeric($instanciaId)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Debe especificar una instancia de sorteo válida.',
                ], 400);
            }

            $resultado = app(ExecuteSorteoAction::class)->execute((int) $instanciaId);

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resetea los ganadores de un sorteo específico o de todos (solo para administradores).
     */
    public function resetearGanadores(Request $request): JsonResponse
    {
        try {
            $sorteoId = $request->input('sorteo_id');

            // Validar sorteo_id si se proporciona
            if ($sorteoId !== null && ! is_numeric($sorteoId)) {
                return response()->json([
                    'error' => 'El ID del sorteo debe ser un número válido.',
                ], 400);
            }

            $resultado = ResetearGanadores::execute($sorteoId ? (int) $sorteoId : null);

            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function updatePremios(UpdatePremiosRequest $request, Sorteo $sorteo): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        $premiosConfig = array_map(function ($item) {
            return [
                'premio_id' => (int) $item['premio_id'],
                'posicion' => (int) $item['posicion'],
            ];
        }, $data['premios']);

        UpdateSorteoPremios::execute($sorteo, $premiosConfig);

        if ($request->expectsJson()) {
            return (new SorteoResource($sorteo->fresh('premios')))
                ->additional(['status' => 'ok'])
                ->response();
        }

        return redirect()->route('sorteo')
            ->with('status', 'Premios asignados correctamente');
    }

    public function addPremio(AddPremioRequest $request, Sorteo $sorteo): RedirectResponse|JsonResponse
    {
        if (! $request->user()) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $data = $request->validated();

        try {
            AddPremioToSorteo::execute($sorteo, (int) $data['premio_id'], (int) $data['posicion']);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }

        if ($request->expectsJson()) {
            return (new SorteoResource($sorteo->fresh('premios')))
                ->additional(['status' => 'ok', 'message' => 'Premio agregado'])
                ->response();
        }

        return redirect()->route('sorteo')
            ->with('status', 'Premio agregado');
    }

    public function removePremio(RemovePremioRequest $request, Sorteo $sorteo): RedirectResponse|JsonResponse
    {
        if (! $request->user()) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $data = $request->validated();

        RemovePremioFromSorteo::execute($sorteo, (int) $data['premio_id'], (int) $data['posicion']);

        if ($request->expectsJson()) {
            return (new SorteoResource($sorteo->fresh('premios')))
                ->additional(['status' => 'ok', 'message' => 'Premio eliminado'])
                ->response();
        }

        return redirect()->route('sorteo')
            ->with('status', 'Premio eliminado');
    }

    public function toggleStatus(ToggleStatusRequest $request, Sorteo $sorteo): RedirectResponse|JsonResponse
    {
        $data = $request->validated();

        try {
            ToggleSorteoStatus::execute($sorteo, (bool) $data['is_active']);
        } catch (\Throwable $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], 422);
            }

            return back()->withErrors(['error' => $e->getMessage()]);
        }

        if ($request->expectsJson()) {
            return (new SorteoResource($sorteo->fresh()))
                ->additional(['status' => 'ok', 'message' => 'Estado actualizado'])
                ->response();
        }

        return back()->with('status', 'Estado actualizado');
    }

    public function reorderPremios(ReorderPremiosRequest $request, Sorteo $sorteo): RedirectResponse|JsonResponse
    {
        if (! $request->user()) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $data = $request->validated();
        $premiosConfig = array_map(function ($item) {
            return [
                'premio_id' => (int) $item['premio_id'],
                'posicion' => (int) $item['posicion'],
            ];
        }, $data['premios']);

        UpdateSorteoPremios::execute($sorteo, $premiosConfig);

        if ($request->expectsJson()) {
            return (new SorteoResource($sorteo->fresh('premios')))
                ->additional(['status' => 'ok', 'message' => 'Premios reordenados'])
                ->response();
        }

        return redirect()->route('sorteo')
            ->with('status', 'Premios reordenados');
    }
}
