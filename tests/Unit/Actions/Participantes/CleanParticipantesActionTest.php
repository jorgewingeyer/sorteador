<?php

namespace Tests\Unit\Actions\Participantes;

use App\Actions\Participantes\CleanParticipantesAction;
use App\Models\Ganador;
use App\Models\ImportLog;
use App\Models\Inscripto;
use App\Models\InstanciaSorteo;
use App\Models\ParticipanteSorteo;
use App\Models\Premio;
use App\Models\PremioInstancia;
use App\Models\Sorteo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CleanParticipantesActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_populates_participantes_sorteo_from_inscriptos_deduplicating_cartons(): void
    {
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);
        $instancia = InstanciaSorteo::create([
            'sorteo_id' => $sorteo->id,
            'nombre' => 'Instancia 1',
            'fecha_ejecucion' => now(),
        ]);

        $log = ImportLog::create([
            'sorteo_id' => $sorteo->id,
            'file_name' => 'test.csv',
            'file_size' => 100,
            'total_rows' => 4,
            'imported_rows' => 4,
            'skipped_rows' => 0,
            'error_log' => [],
        ]);

        // Cartón 1001 aparece 3 veces (distintos DNI)
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '111', 'carton_number' => '1001', 'full_name' => 'A', 'import_log_id' => $log->id]);
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '222', 'carton_number' => '1001', 'full_name' => 'B', 'import_log_id' => $log->id]);
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '333', 'carton_number' => '1001', 'full_name' => 'C', 'import_log_id' => $log->id]);
        // Cartón 2001 aparece 1 vez
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '444', 'carton_number' => '2001', 'full_name' => 'D', 'import_log_id' => $log->id]);

        $result = CleanParticipantesAction::execute($instancia->id);

        $this->assertEquals(2, $result['count']); // 1001 y 2001
        $this->assertEquals(2, ParticipanteSorteo::count());
        $this->assertDatabaseHas('participantes_sorteo', ['carton_number' => '1001']);
        $this->assertDatabaseHas('participantes_sorteo', ['carton_number' => '2001']);
    }

    public function test_it_excludes_cartons_that_already_won_in_previous_instances(): void
    {
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Multietapa', 'instancias_por_sorteo' => 10]);

        $instancia1 = InstanciaSorteo::create(['sorteo_id' => $sorteo->id, 'nombre' => 'Instancia 1', 'fecha_ejecucion' => now()->subDay()]);
        $instancia2 = InstanciaSorteo::create(['sorteo_id' => $sorteo->id, 'nombre' => 'Instancia 2', 'fecha_ejecucion' => now()]);

        $log = ImportLog::create([
            'sorteo_id' => $sorteo->id,
            'file_name' => 'test.csv',
            'file_size' => 100,
            'total_rows' => 2,
            'imported_rows' => 2,
            'skipped_rows' => 0,
            'error_log' => [],
        ]);

        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '111', 'carton_number' => 'WINNER', 'full_name' => 'Ganador', 'import_log_id' => $log->id]);
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '222', 'carton_number' => 'LOSER', 'full_name' => 'Perdedor', 'import_log_id' => $log->id]);

        $inscriptoGanador = Inscripto::where('carton_number', 'WINNER')->first();

        $premio = Premio::create(['nombre' => 'Premio Test']);
        $premioInstancia = PremioInstancia::create([
            'instancia_sorteo_id' => $instancia1->id,
            'premio_id' => $premio->id,
            'posicion' => 1,
        ]);

        Ganador::create([
            'instancia_sorteo_id' => $instancia1->id,
            'carton_number' => 'WINNER',
            'premio_instancia_id' => $premioInstancia->id,
            'winning_position' => 1,
            'inscripto_id' => $inscriptoGanador->id,
        ]);

        $result = CleanParticipantesAction::execute($instancia2->id);

        $this->assertEquals(1, $result['count']);
        $this->assertDatabaseHas('participantes_sorteo', ['carton_number' => 'LOSER']);
        $this->assertDatabaseMissing('participantes_sorteo', ['carton_number' => 'WINNER']);
    }

    public function test_it_excludes_participants_from_old_imports_not_present_in_latest_csv(): void
    {
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Acumulativo', 'instancias_por_sorteo' => 10]);
        $instancia = InstanciaSorteo::create([
            'sorteo_id' => $sorteo->id,
            'nombre' => 'Instancia 1',
            'fecha_ejecucion' => now(),
        ]);

        // Import antiguo (participantes que ya no están en el padrón actual)
        $oldLog = ImportLog::create([
            'sorteo_id' => $sorteo->id,
            'file_name' => 'primer_csv.csv',
            'file_size' => 100,
            'total_rows' => 2,
            'imported_rows' => 2,
            'skipped_rows' => 0,
            'error_log' => [],
        ]);

        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '999', 'carton_number' => 'OLD-001', 'full_name' => 'Fantasma', 'import_log_id' => $oldLog->id]);
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '888', 'carton_number' => 'OLD-002', 'full_name' => 'Fantasma 2', 'import_log_id' => $oldLog->id]);

        // Import nuevo (CSV acumulativo): OLD-001 sigue en el padrón, OLD-002 fue removido, NEW-001 es nuevo
        $newLog = ImportLog::create([
            'sorteo_id' => $sorteo->id,
            'file_name' => 'segundo_csv.csv',
            'file_size' => 200,
            'total_rows' => 2,
            'imported_rows' => 1,
            'skipped_rows' => 1,
            'error_log' => [],
        ]);

        // OLD-001 aparece en el nuevo CSV → su import_log_id se actualiza al nuevo log
        Inscripto::where('sorteo_id', $sorteo->id)->where('carton_number', 'OLD-001')->update(['import_log_id' => $newLog->id]);
        // OLD-002 NO está en el nuevo CSV → conserva import_log_id del log viejo (fantasma)
        // NEW-001 es un participante nuevo del último CSV
        Inscripto::create(['sorteo_id' => $sorteo->id, 'dni' => '777', 'carton_number' => 'NEW-001', 'full_name' => 'Nuevo', 'import_log_id' => $newLog->id]);

        $result = CleanParticipantesAction::execute($instancia->id);

        // Solo OLD-001 y NEW-001 deben estar habilitados (del último import)
        // OLD-002 es fantasma: estaba en import viejo pero no en el nuevo CSV
        $this->assertEquals(2, $result['count']);
        $this->assertDatabaseHas('participantes_sorteo', ['carton_number' => 'OLD-001']);
        $this->assertDatabaseHas('participantes_sorteo', ['carton_number' => 'NEW-001']);
        $this->assertDatabaseMissing('participantes_sorteo', ['carton_number' => 'OLD-002']);
    }
}
