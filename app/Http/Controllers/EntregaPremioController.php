<?php

namespace App\Http\Controllers;

use App\Actions\Sorteo\RegisterEntregaPremioAction;
use App\Actions\EntregaPremio\GenerateDeliveryReceiptAction;
use App\Models\EntregaPremio;
use App\Http\Requests\EntregaPremio\StoreRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;

class EntregaPremioController extends Controller
{
    public function store(StoreRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        
        try {
            $foto = $request->file('foto_evidencia');
            
            RegisterEntregaPremioAction::execute(
                (int) $data['ganador_id'], 
                $data, 
                $foto
            );

            if ($request->expectsJson()) {
                return response()->json(['status' => 'ok', 'message' => 'Entrega registrada correctamente.']);
            }

            return back()->with('status', 'Entrega registrada correctamente.');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json(['status' => 'error', 'message' => $e->getMessage()], 422);
            }
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function downloadReceipt(EntregaPremio $entrega): Response
    {
        return GenerateDeliveryReceiptAction::execute($entrega);
    }
}
