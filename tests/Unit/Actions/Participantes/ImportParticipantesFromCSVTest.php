<?php

namespace Tests\Unit\Actions\Participantes;

use App\Actions\Participantes\ImportParticipantesFromCSV;
use App\Models\ImportLog;
use App\Models\Inscripto;
use App\Models\Sorteo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImportParticipantesFromCSVTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_imports_participantes_from_csv(): void
    {
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);

        Storage::fake('local');
        $content = "Nombre,DNI,Nro. Carton,Tel.\nJuan Perez,12345678,1001,111111\nMaria Gomez,87654321,1002,222222\n";
        $file = UploadedFile::fake()->createWithContent('participantes.csv', $content);

        ImportParticipantesFromCSV::execute($file, $sorteo->id);

        $this->assertEquals(2, Inscripto::count());
        $this->assertDatabaseHas('inscriptos', ['dni' => '12345678', 'carton_number' => '1001']);
        $this->assertDatabaseHas('inscriptos', ['dni' => '87654321', 'carton_number' => '1002']);
    }

    public function test_it_handles_incremental_import_ignoring_duplicates(): void
    {
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);

        $oldLog = ImportLog::create([
            'sorteo_id' => $sorteo->id,
            'file_name' => 'first.csv',
            'file_size' => 100,
            'total_rows' => 1,
            'imported_rows' => 1,
            'skipped_rows' => 0,
            'error_log' => [],
        ]);

        Inscripto::create([
            'sorteo_id' => $sorteo->id,
            'full_name' => 'Juan Perez',
            'dni' => '12345678',
            'carton_number' => '1001',
            'import_log_id' => $oldLog->id,
        ]);

        $content = "Nombre,DNI,Nro. Carton\nJuan Perez,12345678,1001\nNuevo Usuario,55555555,2001\n";
        $file = UploadedFile::fake()->createWithContent('update.csv', $content);

        ImportParticipantesFromCSV::execute($file, $sorteo->id);

        // 2 registros en total (1 existente + 1 nuevo)
        $this->assertEquals(2, Inscripto::count());
        $this->assertDatabaseHas('inscriptos', ['dni' => '55555555']);
    }

    public function test_it_updates_import_log_id_on_existing_records(): void
    {
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);

        $oldLog = ImportLog::create([
            'sorteo_id' => $sorteo->id,
            'file_name' => 'first.csv',
            'file_size' => 100,
            'total_rows' => 1,
            'imported_rows' => 1,
            'skipped_rows' => 0,
            'error_log' => [],
        ]);

        // Participante existente del import viejo
        Inscripto::create([
            'sorteo_id' => $sorteo->id,
            'full_name' => 'Juan Perez',
            'dni' => '12345678',
            'carton_number' => '1001',
            'import_log_id' => $oldLog->id,
        ]);

        // CSV nuevo (acumulativo) que incluye al participante existente + uno nuevo
        $content = "Nombre,DNI,Nro. Carton\nJuan Perez,12345678,1001\nNuevo Usuario,55555555,2001\n";
        $file = UploadedFile::fake()->createWithContent('update.csv', $content);

        ImportParticipantesFromCSV::execute($file, $sorteo->id);

        // El import_log_id del participante existente debe haber sido actualizado al nuevo log
        $newLog = ImportLog::where('sorteo_id', $sorteo->id)->latest('id')->first();
        $this->assertNotEquals($oldLog->id, $newLog->id);

        $inscripto = Inscripto::where('dni', '12345678')->first();
        $this->assertEquals($newLog->id, $inscripto->import_log_id);

        // El nuevo participante también debe tener el nuevo import_log_id
        $nuevo = Inscripto::where('dni', '55555555')->first();
        $this->assertEquals($newLog->id, $nuevo->import_log_id);
    }
}
