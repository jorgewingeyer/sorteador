<?php

namespace Tests\Feature\Controllers;

use App\Models\EntregaPremio;
use App\Models\Ganador;
use App\Models\Inscripto;
use App\Models\InstanciaSorteo;
use App\Models\Premio;
use App\Models\PremioInstancia;
use App\Models\Sorteo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EntregaPremioDownloadReceiptTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_downloads_delivery_receipt_pdf()
    {
        $user = User::factory()->create();
        
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);
        $instancia = InstanciaSorteo::create([
            'sorteo_id' => $sorteo->id,
            'nombre' => 'Instancia 1',
            'fecha_ejecucion' => now(),
        ]);
        $premio = Premio::create([
            'nombre' => 'Auto 0KM',
            'descripcion' => 'Un auto nuevo'
        ]);
        $premioInstancia = PremioInstancia::create([
            'instancia_sorteo_id' => $instancia->id,
            'premio_id' => $premio->id,
            'posicion' => 1,
            'cantidad' => 1
        ]);
        
        $inscripto = Inscripto::create([
            'sorteo_id' => $sorteo->id,
            'full_name' => 'John Doe',
            'dni' => '12345678',
            'carton_number' => '1001',
            'phone' => '555-1234',
        ]);
        
        $ganador = Ganador::create([
            'instancia_sorteo_id' => $instancia->id,
            'carton_number' => $inscripto->carton_number,
            'premio_instancia_id' => $premioInstancia->id,
            'winning_position' => 1,
            'inscripto_id' => $inscripto->id,
        ]);
        
        $entrega = EntregaPremio::create([
            'ganador_id' => $ganador->id,
            'fecha_entrega' => now(),
            'nombre_receptor' => 'Jane Doe',
            'dni_receptor' => '87654321',
            'observaciones' => 'Test delivery',
            'foto_evidencia_path' => 'evidence.jpg'
        ]);

        $response = $this->actingAs($user)->get(route('entregas.downloadReceipt', $entrega));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        // $response->assertHeader('Content-Disposition', 'attachment; filename="recibo-entrega-' . $entrega->id . '.pdf"');
    }
}
