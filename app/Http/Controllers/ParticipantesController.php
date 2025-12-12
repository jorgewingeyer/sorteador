<?php

namespace App\Http\Controllers;

use App\Actions\Participantes\GetAllParticipantes;
use App\Actions\Participantes\ImportParticipantesFromCSV;
use App\Http\Requests\Participantes\ImportRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ParticipantesController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('participantes/participantes');
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
                'message' => 'Importación iniciada en segundo plano. Se están procesando ' . $stats['processed'] . ' registros.',
                'stats' => $stats,
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
        }

        return redirect()->route('participantes')
            ->with('status', 'Importación iniciada en segundo plano: ' . $stats['processed'] . ' filas en proceso.');
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
        ]);
    }
}
