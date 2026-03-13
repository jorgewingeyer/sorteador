<?php

namespace Tests\Unit\Actions\Sorteo;

use App\Actions\Sorteo\RegisterEntregaPremioAction;
use App\Models\EntregaPremio;
use App\Models\Ganador;
use App\Models\Inscripto;
use App\Models\InstanciaSorteo;
use App\Models\Premio;
use App\Models\PremioInstancia;
use App\Models\Sorteo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RegisterEntregaPremioActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_prize_delivery_with_evidence()
    {
        Storage::fake('public');

        // 1. Setup
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

        // 2. Ejecutar Action
        $foto = UploadedFile::fake()->image('evidencia.jpg');
        $data = [
            'dni_receptor' => '99999999', // Retira otra persona
            'nombre_receptor' => 'Familiar Autorizado',
            'observaciones' => 'Retira con autorización firmada'
        ];

        $entrega = RegisterEntregaPremioAction::execute($ganador->id, $data, $foto);

        // 3. Assert
        $this->assertInstanceOf(EntregaPremio::class, $entrega);
        $this->assertDatabaseHas('entregas_premios', [
            'ganador_id' => $ganador->id,
            'dni_receptor' => '99999999',
            'nombre_receptor' => 'Familiar Autorizado'
        ]);
        
        // Verificar que la foto se guardó
        Storage::disk('public')->assertExists($entrega->foto_evidencia_path);
    }

    public function test_it_prevents_duplicate_delivery()
    {
        // 1. Setup (Similar al anterior)
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

        // Primera entrega
        RegisterEntregaPremioAction::execute($ganador->id, []);

        // Segunda entrega (debe fallar)
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El premio para este ganador ya ha sido entregado');

        RegisterEntregaPremioAction::execute($ganador->id, []);
    }
}
