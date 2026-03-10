<?php

namespace Tests\Unit\Actions\Sorteo;

use App\Actions\Sorteo\ExecuteSorteoAction;
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
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test']);
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
            'cantidad' => 1
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

        // 5. Ejecutar Sorteo
        // Mockeamos random_int para que siempre elija el índice 0 (Cartón 1001 si está ordenado o primero en inserción)
        // En un test real de integración es difícil predecir el random, pero verificamos la consistencia del resultado.
        $result = ExecuteSorteoAction::execute($instancia->id);

        // 6. Assert
        $this->assertArrayHasKey('carton_ganador', $result);
        $cartonGanador = $result['carton_ganador'];

        // Verificar que se creó el registro en ganadores
        $this->assertDatabaseHas('ganadores', [
            'instancia_sorteo_id' => $instancia->id,
            'carton_number' => $cartonGanador,
            'winning_position' => 1,
        ]);

        // Si ganó el 1001, debe haber 2 registros de ganadores (Juan y Pedro)
        if ($cartonGanador == '1001') {
            $this->assertEquals(2, Ganador::where('carton_number', '1001')->count());
        } else {
            $this->assertEquals(1, Ganador::where('carton_number', '2001')->count());
        }

        // Verificar que el ganador fue eliminado de participantes_sorteo (para no volver a ganar en esta instancia)
        $this->assertDatabaseMissing('participantes_sorteo', [
            'instancia_sorteo_id' => $instancia->id,
            'carton_number' => $cartonGanador
        ]);
    }

    public function test_it_throws_exception_if_no_prizes_available()
    {
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test']);
        $instancia = InstanciaSorteo::create([
            'sorteo_id' => $sorteo->id,
            'nombre' => 'Instancia 1',
            'fecha_ejecucion' => now(),
        ]);

        ParticipanteSorteo::create(['instancia_sorteo_id' => $instancia->id, 'carton_number' => '1001', 'procesado_en' => now()]);

        // No creamos premios en PremioInstancia

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No hay más premios configurados');

        ExecuteSorteoAction::execute($instancia->id);
    }
}
