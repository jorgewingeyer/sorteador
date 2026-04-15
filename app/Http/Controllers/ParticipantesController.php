<?php

namespace App\Http\Controllers;

use App\Actions\Participantes\GetAllParticipantes;
use App\Actions\Participantes\ImportParticipantesFromCSV;
use App\Http\Requests\Participantes\ImportRequest;
use App\Models\ImportLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ParticipantesController extends Controller
{
    public function index(Request $request)
    {
        $sorteoId = $request->query('sorteo_id');
        $sorteo = null;
        if ($sorteoId) {
            $sorteo = \App\Models\Sorteo::find($sorteoId);
        }

        $sorteos = \App\Models\Sorteo::orderBy('created_at', 'desc')->get();

        $participantes = null;
        if ($sorteoId) {
            $participantes = GetAllParticipantes::execute($request->all());
        }

        return Inertia::render('participantes/participantes', [
            'sorteoId' => $sorteoId,
            'sorteo' => $sorteo ? (new \App\Http\Resources\SorteoResource($sorteo))->resolve() : null,
            'sorteos' => $sorteos,
            'participantes' => $participantes,
        ]);
    }

    /**
     * Process CSV upload and import participantes.
     */
    public function import(ImportRequest $request): JsonResponse|RedirectResponse
    {
        ini_set('memory_limit', '512M');
        set_time_limit(300); // Allow more time for large files
        $validated = $request->validated();
        $stats = ImportParticipantesFromCSV::execute($request->file('file'), (int) $validated['sorteo_id']);

        Log::info('CSV import queued', [
            'processed' => $stats['processed'],
            'chunks' => $stats['chunks'],
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'status' => $stats['status'],
                'message' => 'Importación iniciada en segundo plano. Se están procesando '.$stats['processed'].' registros.',
                'stats' => $stats,
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
        }

        return redirect()->route('participantes', ['sorteo_id' => $validated['sorteo_id']])
            ->with('status', 'Importación iniciada en segundo plano: '.$stats['processed'].' filas en proceso.');
    }

    /**
     * List participantes with pagination, filters, and sorting.
     */
    public function list(Request $request): JsonResponse
    {
        return GetAllParticipantes::execute([
            'page' => (int) $request->query('page', 1),
            'per_page' => (int) $request->query('per_page', 50),
            'sort' => (string) $request->query('sort', 'created_at'),
            'direction' => (string) $request->query('direction', 'desc'),
            'q' => (string) $request->query('q', ''),
            'sorteo_id' => (string) $request->query('sorteo_id', ''),
            'province' => (string) $request->query('province', ''),
            'ganador_status' => (string) $request->query('ganador_status', ''),
        ])->response();
    }

    /**
     * Obtener estadísticas de participantes para un sorteo.
     */
    public function stats(Request $request): JsonResponse
    {
        return \App\Actions\Participantes\GetParticipantesStats::execute([
            'sorteo_id' => (int) $request->query('sorteo_id', 0),
        ]);
    }

    /**
     * Get import logs for a sorteo.
     */
    public function logs(Request $request): JsonResponse
    {
        $sorteoId = $request->query('sorteo_id');

        if (! $sorteoId) {
            return response()->json(['data' => []]);
        }

        $logs = ImportLog::where('sorteo_id', $sorteoId)
            ->with('user:id,name')
            ->latest()
            ->paginate(10);

        return response()->json($logs);
    }
}
