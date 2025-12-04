<?php

namespace App\Http\Controllers;

use App\Actions\Sorteo\GetAllSorteos;
use App\Actions\Sorteo\StoreSorteo;
use App\Http\Requests\Sorteo\StoreRequest;
use App\Http\Resources\SorteoResource;
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
            'sort' => 'fecha',
            'direction' => 'desc',
        ]);

        return Inertia::render('sorteo/sorteo', [
            'listSorteos' => $response->getData(true),
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        return GetAllSorteos::execute([
            'page' => (int) $request->query('page', 1),
            'per_page' => (int) $request->query('per_page', 15),
            'sort' => (string) $request->query('sort', 'fecha'),
            'direction' => (string) $request->query('direction', 'desc'),
            'nombre' => (string) $request->query('nombre', ''),
            'fecha_from' => (string) $request->query('fecha_from', ''),
            'fecha_to' => (string) $request->query('fecha_to', ''),
            'estado' => (string) $request->query('estado', ''),
        ]);
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
            ->with('status', 'Sorteo creado correctamente');
    }
}
