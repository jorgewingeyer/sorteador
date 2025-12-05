#!/usr/bin/env php
<?php

/**
 * Script de prueba para verificar el filtro de ganadores
 * Uso: php test_ganador_filter.php
 */

define('LARAVEL_START', microtime(true));

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Participante;

echo "=== TEST DE FILTRO DE GANADORES ===\n\n";

// Test 1: Total de participantes
$total = Participante::count();
echo "✓ Total participantes: {$total}\n";

// Test 2: Ganadores (whereNotNull)
$ganadores = Participante::whereNotNull('ganador_en')->count();
echo "✓ Total GANADORES (whereNotNull): {$ganadores}\n";

// Test 3: No ganadores (whereNull)
$noGanadores = Participante::whereNull('ganador_en')->count();
echo "✓ Total NO GANADORES (whereNull): {$noGanadores}\n";

// Test 4: Sumar = Total
$suma = $ganadores + $noGanadores;
echo "✓ Suma (ganadores + no ganadores): {$suma}\n";

if ($suma === $total) {
    echo "✅ CORRECTO: La suma coincide con el total\n\n";
} else {
    echo "❌ ERROR: La suma NO coincide ({$suma} vs {$total})\n\n";
}

// Test 5: Mostrar primeros 5 ganadores
echo "=== PRIMEROS 5 GANADORES ===\n";
$primerosGanadores = Participante::whereNotNull('ganador_en')
    ->orderBy('ganador_en', 'asc')
    ->limit(5)
    ->get(['id', 'full_name', 'dni', 'ganador_en']);

foreach ($primerosGanadores as $g) {
    echo "  🏆 #{$g->ganador_en} - {$g->full_name} (DNI: {$g->dni})\n";
}

if ($primerosGanadores->isEmpty()) {
    echo "  (No hay ganadores todavía)\n";
}

echo "\n=== FIN DEL TEST ===\n";
