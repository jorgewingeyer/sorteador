<?php

namespace App\Jobs;

use App\Actions\Participantes\Transformers\CsvParticipanteTransformer;
use App\Actions\Participantes\Validators\ParticipanteRowValidator;
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
        public int $sorteoId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
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

        if (! empty($batch)) {
            // Usamos insertOrIgnore para manejar la lógica incremental
            // Si el registro (sorteo_id, dni, carton_number) ya existe, se ignora.
            DB::table('inscriptos')->insertOrIgnore($batch);
        }

        Log::info('CSV Chunk processed', [
            'processed_rows' => count($batch),
            'failed' => $failed,
            'sorteo_id' => $this->sorteoId,
        ]);
    }
}
