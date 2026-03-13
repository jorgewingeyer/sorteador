<?php

namespace App\Jobs;

use App\Actions\Participantes\Transformers\CsvParticipanteTransformer;
use App\Actions\Participantes\Validators\ParticipanteRowValidator;
use App\Models\ImportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessCsvChunk implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @param array<int, array<string, string|null>> $chunk
     */
    public function __construct(
        public array $chunk,
        public int $sorteoId,
        public int $importLogId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Job ProcessCsvChunk started', ['rows' => count($this->chunk), 'sorteo_id' => $this->sorteoId]);

        $batch = [];
        $failed = 0;
        $now = now();

        foreach ($this->chunk as $row) {
            try {
                // Transform row using the existing Transformer logic which handles sanitization and mapping
                $mapped = CsvParticipanteTransformer::execute($row, $this->sorteoId);

                $validation = ParticipanteRowValidator::execute($mapped);

                if (! $validation['valid']) {
                    $failed++;
                    continue;
                }

                $mapped['created_at'] = $now;
                $mapped['updated_at'] = $now;
                $batch[] = $mapped;
            } catch (\Throwable $e) {
                $failed++;
                Log::error('Error processing CSV row in job', ['error' => $e->getMessage(), 'row' => $row]);
            }
        }

        $insertedCount = 0;
        if (! empty($batch)) {
            
            try {
                // Usamos insertOrIgnore para manejar la lógica incremental
                // Si el registro (sorteo_id, dni, carton_number) ya existe, se ignora.
                $insertedCount = DB::table('inscriptos')->insertOrIgnore($batch);
                Log::info('Batch inserted', ['count' => count($batch), 'result' => $insertedCount]);
            } catch (\Throwable $e) {
                Log::error('Database insert failed in job', ['error' => $e->getMessage()]);
                throw $e; // Retry job
            }
        }

        // Update import log
        try {
            $log = ImportLog::find($this->importLogId);
            if ($log) {
                $log->increment('imported_rows', $insertedCount);
                $log->increment('skipped_rows', $failed + (count($batch) - $insertedCount));
            }
        } catch (\Throwable $e) {
            Log::error('Failed to update import log', ['error' => $e->getMessage()]);
        }

        Log::info('CSV Chunk processed', [
            'processed_rows' => count($batch),
            'failed' => $failed,
            'inserted' => $insertedCount,
            'sorteo_id' => $this->sorteoId,
        ]);
    }
}
