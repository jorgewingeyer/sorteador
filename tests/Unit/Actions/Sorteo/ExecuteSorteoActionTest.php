<?php

namespace Tests\Unit\Actions\Sorteo;

use App\Actions\Sorteo\ExecuteSorteoAction;
use App\Contracts\RandomizerContract;
use App\Models\Ganador;
use App\Models\Inscripto;
use App\Models\InstanciaSorteo;
use App\Models\ParticipanteSorteo;
use App\Models\Premio;
use App\Models\PremioInstancia;
use App\Models\Sorteo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExecuteSorteoActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_executes_sorteo_selecting_random_winner()
    {
        // 1. Setup
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);
        $instancia = InstanciaSorteo::create([
            'sorteo_id' => $sorteo->id,
            'nombre' => 'Instancia 1',
            'fecha_ejecucion' => now(),
        ]);

        // 2. Configurar Premio
        $premio = Premio::create(['nombre' => 'Auto 0KM']);
        $premioInstancia = PremioInstancia::create([
            'instancia_sorteo_id' => $instancia->id,
            'premio_id' => $premio->id,
            'posicion' => 1,
            'cantidad' => 1,
        ]);

        // 3. Configurar Participantes (Tabla limpia)
        // Cartón 1001 (Ganador potencial)
        ParticipanteSorteo::create(['instancia_sorteo_id' => $instancia->id, 'carton_number' => '1001', 'procesado_en' => now()]);
        // Cartón 2001
        ParticipanteSorteo::create(['instancia_sorteo_id' => $instancia->id, 'carton_number' => '2001', 'procesado_en' => now()]);

        // 4. Configurar Inscriptos (Raw data para vincular ganador)
        // El cartón 1001 lo tienen 2 personas (Duplicado en inscriptos)
        $inscripto1 = Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '111', 'carton_number' => '1001', 'full_name' => 'Juan']);
        $inscripto2 = Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '222', 'carton_number' => '1001', 'full_name' => 'Pedro']);
        $inscripto3 = Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '333', 'carton_number' => '2001', 'full_name' => 'Maria']);

        // 5. Ejecutar Sorteo con mock determinista (siempre elige índice 0 → cartón 1001)
        $mockRng = $this->createMock(RandomizerContract::class);
        $mockRng->method('randomInt')->willReturn(0);

        $action = new ExecuteSorteoAction($mockRng);
        $result = $action->execute($instancia->id);

        // 6. Assert
        $this->assertArrayHasKey('carton_number', $result);
        $cartonGanador = $result['carton_number'];

        // Con índice 0 y orderBy('id'), siempre gana el cartón 1001 (primer participante insertado)
        $this->assertEquals('1001', $cartonGanador);

        // Verificar que se creó el registro en ganadores
        $this->assertDatabaseHas('ganadores', [
            'instancia_sorteo_id' => $instancia->id,
            'carton_number' => '1001',
            'winning_position' => 1,
        ]);

        // El cartón 1001 lo tienen Juan y Pedro → 2 registros de ganadores
        $this->assertEquals(2, Ganador::where('carton_number', '1001')->count());

        // Verificar que el ganador fue eliminado de participantes_sorteo (para no volver a ganar en esta instancia)
        $this->assertDatabaseMissing('participantes_sorteo', [
            'instancia_sorteo_id' => $instancia->id,
            'carton_number' => '1001',
        ]);
    }

    public function test_it_throws_exception_if_no_prizes_available()
    {
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);
        $instancia = InstanciaSorteo::create([
            'sorteo_id' => $sorteo->id,
            'nombre' => 'Instancia 1',
            'fecha_ejecucion' => now(),
        ]);

        ParticipanteSorteo::create(['instancia_sorteo_id' => $instancia->id, 'carton_number' => '1001', 'procesado_en' => now()]);

        // No creamos premios en PremioInstancia

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No hay más premios configurados');

        $mockRng = $this->createMock(RandomizerContract::class);
        $action = new ExecuteSorteoAction($mockRng);
        $action->execute($instancia->id);
    }
}
