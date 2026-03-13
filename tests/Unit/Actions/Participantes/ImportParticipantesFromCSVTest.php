<?php

namespace Tests\Unit\Actions\Participantes;

use App\Actions\Participantes\ImportParticipantesFromCSV;
use App\Models\Inscripto;
use App\Models\Sorteo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImportParticipantesFromCSVTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_imports_participantes_from_csv()
    {
        // 1. Crear Sorteo
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);

        // 2. Crear archivo CSV simulado
        Storage::fake('local');
        $header = "Nombre,DNI,Nro. Carton,Tel.\n";
        $row1 = "Juan Perez,12345678,1001,111111\n";
        $row2 = "Maria Gomez,87654321,1002,222222\n";
        $content = $header . $row1 . $row2;

        $file = UploadedFile::fake()->createWithContent('participantes.csv', $content);

        // 3. Ejecutar Action
        $result = ImportParticipantesFromCSV::execute($file, $sorteo->id);

        // 4. Assert
        $this->assertEquals(2, Inscripto::count());
        $this->assertDatabaseHas('inscriptos', ['dni' => '12345678', 'carton_number' => '1001']);
        $this->assertDatabaseHas('inscriptos', ['dni' => '87654321', 'carton_number' => '1002']);
    }

    public function test_it_handles_incremental_import_ignoring_duplicates()
    {
        $sorteo = Sorteo::create(['nombre' => 'Sorteo Test', 'instancias_por_sorteo' => 10]);

        // Insertar un participante previo
        Inscripto::create([
            'sorteo_id' => $sorteo->id,
            'full_name' => 'Juan Perez',
            'dni' => '12345678',
            'carton_number' => '1001',
        ]);

        // CSV con el mismo participante + uno nuevo
        $header = "Nombre,DNI,Nro. Carton\n";
        $row1 = "Juan Perez,12345678,1001\n"; // Duplicado
        $row2 = "Nuevo Usuario,55555555,2001\n"; // Nuevo
        $content = $header . $row1 . $row2;

        $file = UploadedFile::fake()->createWithContent('update.csv', $content);

        ImportParticipantesFromCSV::execute($file, $sorteo->id);

        // Debería haber 2 registros en total (1 existente + 1 nuevo), no 3.
        $this->assertEquals(2, Inscripto::count());
        $this->assertDatabaseHas('inscriptos', ['dni' => '55555555']);
    }
}
