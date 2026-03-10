<?php

namespace Tests\Unit\Actions\Participantes;

use App\Actions\Participantes\CleanParticipantesAction;
use App\Models\Ganador;
use App\Models\Inscripto;
use App\Models\InstanciaSorteo;
use App\Models\ParticipanteSorteo;
use App\Models\Sorteo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CleanParticipantesActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_populates_participantes_sorteo_from_inscriptos_deduplicating_cartons()
    {
        // 1. Setup
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test']);
        $instancia = InstanciaSorteo::create([
            'sorteo_id' => $sorteo->id,
            'nombre' => 'Instancia 1',
            'fecha_ejecucion' => now(),
        ]);

        // 2. Crear Inscriptos (con cartones repetidos)
        // Cartón 1001 aparece 3 veces
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '111', 'carton_number' => '1001', 'full_name' => 'A']);
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '222', 'carton_number' => '1001', 'full_name' => 'B']);
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '333', 'carton_number' => '1001', 'full_name' => 'C']);
        // Cartón 2001 aparece 1 vez
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '444', 'carton_number' => '2001', 'full_name' => 'D']);

        // 3. Ejecutar Limpieza
        $result = CleanParticipantesAction::execute($instancia->id);

        // 4. Assert
        $this->assertEquals(2, $result['count']); // 1001 y 2001
        $this->assertEquals(2, ParticipanteSorteo::count());
        $this->assertDatabaseHas('participantes_sorteo', ['carton_number' => '1001']);
        $this->assertDatabaseHas('participantes_sorteo', ['carton_number' => '2001']);
    }

    public function test_it_excludes_cartons_that_already_won_in_previous_instances()
    {
        // 1. Setup
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Multietapa']);
        
        // Instancia Pasada (donde alguien ganó)
        $instancia1 = InstanciaSorteo::create(['sorteo_id' => $sorteo->id, 'nombre' => 'Instancia 1', 'fecha_ejecucion' => now()->subDay()]);
        
        // Instancia Actual
        $instancia2 = InstanciaSorteo::create(['sorteo_id' => $sorteo->id, 'nombre' => 'Instancia 2', 'fecha_ejecucion' => now()]);

        // 2. Crear Inscriptos
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '111', 'carton_number' => 'WINNER', 'full_name' => 'Ganador']);
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '222', 'carton_number' => 'LOSER', 'full_name' => 'Perdedor']);

        // 3. Simular que 'WINNER' ya ganó en la Instancia 1
        // Nota: Necesitamos crear el inscripto primero para la FK
        $inscriptoGanador = Inscripto::where('carton_number', 'WINNER')->first();
        
        // Simular un premio
        $premio = \App\Models\Premio::create(['nombre' => 'Premio Test']);
        $premioInstancia = \App\Models\PremioInstancia::create([
            'instancia_sorteo_id' => $instancia1->id,
            'premio_id' => $premio->id,
            'posicion' => 1
        ]);

        Ganador::create([
            'instancia_sorteo_id' => $instancia1->id,
            'carton_number' => 'WINNER',
            'premio_instancia_id' => $premioInstancia->id,
            'winning_position' => 1,
            'inscripto_id' => $inscriptoGanador->id
        ]);

        // 4. Ejecutar Limpieza para Instancia 2
        $result = CleanParticipantesAction::execute($instancia2->id);

        // 5. Assert
        // Solo debería entrar 'LOSER', porque 'WINNER' ya está en la tabla ganadores del mismo sorteo padre
        $this->assertEquals(1, $result['count']);
        $this->assertDatabaseHas('participantes_sorteo', ['carton_number' => 'LOSER']);
        $this->assertDatabaseMissing('participantes_sorteo', ['carton_number' => 'WINNER']);
    }
}
