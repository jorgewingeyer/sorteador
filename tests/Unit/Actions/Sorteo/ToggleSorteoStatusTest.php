<?php

namespace Tests\Unit\Actions\Sorteo;

use App\Actions\Sorteo\ToggleSorteoStatus;
use App\Models\Sorteo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToggleSorteoStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_activates_sorteo_and_deactivates_others()
    {
        // 1. Setup
        $sorteo1 = Sorteo::create(['nombre' => 'Sorteo 1', 'is_active' => true, 'instancias_por_sorteo' => 10]);
        $sorteo2 = Sorteo::create(['nombre' => 'Sorteo 2', 'is_active' => false, 'instancias_por_sorteo' => 10]);

        // 2. Activar Sorteo 2
        ToggleSorteoStatus::execute($sorteo2, true);

        // 3. Assert
        $this->assertTrue($sorteo2->fresh()->is_active);
        $this->assertFalse($sorteo1->fresh()->is_active);
    }

    public function test_it_deactivates_sorteo()
    {
        // 1. Setup
        $sorteo = Sorteo::create(['nombre' => 'Sorteo 1', 'is_active' => true, 'instancias_por_sorteo' => 10]);

        // 2. Desactivar Sorteo
        ToggleSorteoStatus::execute($sorteo, false);

        // 3. Assert
        $this->assertFalse($sorteo->fresh()->is_active);
    }
}
