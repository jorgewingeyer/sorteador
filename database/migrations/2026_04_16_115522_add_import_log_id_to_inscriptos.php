<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inscriptos', function (Blueprint $table) {
            $table->foreignId('import_log_id')->nullable()->after('sorteo_id')
                ->constrained('import_logs')->nullOnDelete();
        });

        // Backfill: asignar el import_log_id más reciente de cada sorteo a los inscriptos existentes.
        // Esto asegura que el pool inicial refleje el último padrón cargado.
        // Los inscriptos con import_log_id antiguo (de cargas previas no vigentes) serán excluidos
        // automáticamente al re-importar el CSV acumulativo.
        $latestLogs = DB::table('import_logs')
            ->select('sorteo_id', DB::raw('MAX(id) as latest_log_id'))
            ->groupBy('sorteo_id')
            ->get();

        foreach ($latestLogs as $row) {
            DB::table('inscriptos')
                ->where('sorteo_id', $row->sorteo_id)
                ->whereNull('import_log_id')
                ->update(['import_log_id' => $row->latest_log_id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inscriptos', function (Blueprint $table) {
            $table->dropForeign(['import_log_id']);
            $table->dropColumn('import_log_id');
        });
    }
};
