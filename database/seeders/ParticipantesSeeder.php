<?php

namespace Database\Seeders;

use App\Models\Participante;
use App\Models\Sorteo;
use Illuminate\Database\Seeder;

class ParticipantesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear un sorteo de ejemplo si no existe
        $sorteo = Sorteo::firstOrCreate(
            ['nombre' => 'Sorteo de Prueba 2025'],
            ['fecha' => now()]
        );

        // Datos de participantes de ejemplo
        $participantes = [
            ['full_name' => 'María García', 'dni' => '12345678', 'phone' => '+54 9 11 1234-5678', 'location' => 'Buenos Aires', 'province' => 'Buenos Aires', 'carton_number' => 'A-001'],
            ['full_name' => 'Juan Pérez', 'dni' => '23456789', 'phone' => '+54 9 11 2345-6789', 'location' => 'Córdoba', 'province' => 'Córdoba', 'carton_number' => 'A-002'],
            ['full_name' => 'Ana Martínez', 'dni' => '34567890', 'phone' => '+54 9 11 3456-7890', 'location' => 'Rosario', 'province' => 'Santa Fe', 'carton_number' => 'A-003'],
            ['full_name' => 'Carlos López', 'dni' => '45678901', 'phone' => '+54 9 11 4567-8901', 'location' => 'Mendoza', 'province' => 'Mendoza', 'carton_number' => 'A-004'],
            ['full_name' => 'Laura Fernández', 'dni' => '56789012', 'phone' => '+54 9 11 5678-9012', 'location' => 'La Plata', 'province' => 'Buenos Aires', 'carton_number' => 'A-005'],
            ['full_name' => 'Roberto Sánchez', 'dni' => '67890123', 'phone' => '+54 9 11 6789-0123', 'location' => 'San Miguel de Tucumán', 'province' => 'Tucumán', 'carton_number' => 'A-006'],
            ['full_name' => 'Sofía Rodríguez', 'dni' => '78901234', 'phone' => '+54 9 11 7890-1234', 'location' => 'Salta', 'province' => 'Salta', 'carton_number' => 'A-007'],
            ['full_name' => 'Diego González', 'dni' => '89012345', 'phone' => '+54 9 11 8901-2345', 'location' => 'Mar del Plata', 'province' => 'Buenos Aires', 'carton_number' => 'A-008'],
            ['full_name' => 'Valentina Torres', 'dni' => '90123456', 'phone' => '+54 9 11 9012-3456', 'location' => 'San Juan', 'province' => 'San Juan', 'carton_number' => 'A-009'],
            ['full_name' => 'Martín Álvarez', 'dni' => '01234567', 'phone' => '+54 9 11 0123-4567', 'location' => 'Neuquén', 'province' => 'Neuquén', 'carton_number' => 'A-010'],
            ['full_name' => 'Camila Romero', 'dni' => '11234567', 'phone' => '+54 9 11 1123-4567', 'location' => 'Bahía Blanca', 'province' => 'Buenos Aires', 'carton_number' => 'A-011'],
            ['full_name' => 'Federico Morales', 'dni' => '22345678', 'phone' => '+54 9 11 2234-5678', 'location' => 'Posadas', 'province' => 'Misiones', 'carton_number' => 'A-012'],
            ['full_name' => 'Lucía Castro', 'dni' => '33456789', 'phone' => '+54 9 11 3345-6789', 'location' => 'Resistencia', 'province' => 'Chaco', 'carton_number' => 'A-013'],
            ['full_name' => 'Nicolás Ruiz', 'dni' => '44567890', 'phone' => '+54 9 11 4456-7890', 'location' => 'Corrientes', 'province' => 'Corrientes', 'carton_number' => 'A-014'],
            ['full_name' => 'Paula Méndez', 'dni' => '55678901', 'phone' => '+54 9 11 5567-8901', 'location' => 'Santa Fe', 'province' => 'Santa Fe', 'carton_number' => 'A-015'],
            ['full_name' => 'Sebastián Flores', 'dni' => '66789012', 'phone' => '+54 9 11 6678-9012', 'location' => 'San Luis', 'province' => 'San Luis', 'carton_number' => 'A-016'],
            ['full_name' => 'Florencia Vargas', 'dni' => '77890123', 'phone' => '+54 9 11 7789-0123', 'location' => 'Paraná', 'province' => 'Entre Ríos', 'carton_number' => 'A-017'],
            ['full_name' => 'Joaquín Silva', 'dni' => '88901234', 'phone' => '+54 9 11 8890-1234', 'location' => 'Formosa', 'province' => 'Formosa', 'carton_number' => 'A-018'],
            ['full_name' => 'Milagros Domínguez', 'dni' => '99012345', 'phone' => '+54 9 11 9901-2345', 'location' => 'La Rioja', 'province' => 'La Rioja', 'carton_number' => 'A-019'],
            ['full_name' => 'Agustín Ríos', 'dni' => '10123456', 'phone' => '+54 9 11 1012-3456', 'location' => 'Catamarca', 'province' => 'Catamarca', 'carton_number' => 'A-020'],
        ];

        foreach ($participantes as $participante) {
            Participante::firstOrCreate(
                ['dni' => $participante['dni'], 'sorteo_id' => $sorteo->id],
                array_merge($participante, ['sorteo_id' => $sorteo->id])
            );
        }

        $this->command->info('Se crearon ' . count($participantes) . ' participantes de ejemplo para el sorteo: ' . $sorteo->nombre);
    }
}
