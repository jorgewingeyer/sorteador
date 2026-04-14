<?php

namespace App\Actions\EntregaPremio;

use App\Models\EntregaPremio;
use App\Models\Ganador;
use App\Models\Sorteo;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class GenerateDeliveryReceiptAction
{
    public static function execute(EntregaPremio $entrega): Response
    {
        $entrega->load([
            'ganador.inscripto.sorteo',
            'ganador.instanciaSorteo.sorteo',
            'ganador.premioInstancia.premio',
            'ganador.user'
        ]);

        /** @var Ganador $ganador */
        $ganador = $entrega->ganador;
        
        $winnerName = $ganador->inscripto ? $ganador->inscripto->full_name : ($ganador->user ? $ganador->user->name : 'N/A');
        $winnerDni = $ganador->inscripto ? $ganador->inscripto->dni : 'N/A';
        $winnerPhone = $ganador->inscripto ? $ganador->inscripto->phone : 'N/A';
        
        // Get Sorteo from Inscripto or InstanciaSorteo
        /** @var Sorteo $sorteo */
        $sorteo = $ganador->inscripto ? $ganador->inscripto->sorteo : $ganador->instanciaSorteo->sorteo;

        $data = [
            'entrega' => $entrega,
            'ganador' => $ganador,
            'winnerName' => $winnerName,
            'winnerDni' => $winnerDni,
            'winnerPhone' => $winnerPhone,
            'premio' => $ganador->premioInstancia->premio,
            'instancia' => $ganador->instanciaSorteo,
            'sorteo' => $sorteo,
            'logoPath' => storage_path('app/public/logoLoteria.png'),
        ];

        $pdf = Pdf::loadView('pdf.delivery-receipt', $data);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('recibo-entrega-' . $entrega->id . '.pdf');
    }
}
