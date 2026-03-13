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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EntregaPremioControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_creates_entrega_premio_and_redirects()
    {
        Storage::fake('public');
        
        // 1. Setup
        $user = User::factory()->create();
        $this->actingAs($user);

        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);
        $instancia = InstanciaSorteo::create(['sorteo_id' => $sorteo->id, 'nombre' => 'Instancia 1', 'fecha_ejecucion' => now()]);
        $premio = Premio::create(['nombre' => 'Premio Test']);
        $premioInstancia = PremioInstancia::create(['instancia_sorteo_id' => $instancia->id, 'premio_id' => $premio->id, 'posicion' => 1]);
        $inscripto = Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '123', 'carton_number' => '1001', 'full_name' => 'Ganador']);
        
        $ganador = Ganador::create([
            'instancia_sorteo_id' => $instancia->id,
            'carton_number' => '1001',
            'premio_instancia_id' => $premioInstancia->id,
            'winning_position' => 1,
            'inscripto_id' => $inscripto->id
        ]);

        // 2. Request
        $foto = UploadedFile::fake()->image('evidencia.jpg');
        $response = $this->post(route('entregas.store'), [
            'ganador_id' => $ganador->id,
            'dni_receptor' => '99999999',
            'nombre_receptor' => 'Receptor Test',
            'observaciones' => 'Test',
            'foto_evidencia' => $foto
        ]);

        // 3. Assert
        $response->assertRedirect();
        $response->assertSessionHas('status', 'Entrega registrada correctamente.');

        $this->assertDatabaseHas('entregas_premios', [
            'ganador_id' => $ganador->id,
            'dni_receptor' => '99999999'
        ]);

        $entrega = EntregaPremio::first();
        Storage::disk('public')->assertExists($entrega->foto_evidencia_path);
    }
}
