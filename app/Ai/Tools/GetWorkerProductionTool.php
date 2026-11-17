<?php

namespace App\Ai\Tools;

use App\Models\TphHarvestRecord;
use App\Models\Worker;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetWorkerProductionTool implements Tool
{
    public function description(): Stringable|string
    {
        return 'Mengambil peringkat produktivitas tenaga kerja (Pemanen TBS dan Kutip Lapis Brondolan) berdasarkan total karung dan berat bersih Kg.';
    }

    public function handle(Request $request): Stringable|string
    {
        $limit = isset($request['limit']) ? max(1, min(20, (int) $request['limit'])) : 10;
        $divisionId = isset($request['division_id']) ? (int) $request['division_id'] : null;

        $pivotStats = DB::table('tph_harvest_record_worker as pivot')
            ->join('tph_harvest_records as records', 'records.id', '=', 'pivot.tph_harvest_record_id')
            ->when($divisionId !== null && $divisionId > 0, fn ($q) => $q->where('records.division_id', $divisionId))
            ->selectRaw('pivot.worker_id, COUNT(DISTINCT records.id) as lot_count, SUM(records.sack_count) as total_sacks, SUM(records.net_weight_kg) as total_net_kg')
            ->groupBy('pivot.worker_id')
            ->orderByDesc('total_net_kg')
            ->limit($limit)
            ->get();

        if ($pivotStats->isEmpty()) {
            $rows = TphHarvestRecord::query()
                ->with(['worker.division'])
                ->when($divisionId !== null && $divisionId > 0, fn ($q) => $q->where('division_id', $divisionId))
                ->selectRaw('worker_id, COUNT(*) as lot_count, SUM(sack_count) as total_sacks, SUM(net_weight_kg) as total_net_kg')
                ->groupBy('worker_id')
                ->orderByDesc('total_net_kg')
                ->limit($limit)
                ->get()
                ->map(fn (TphHarvestRecord $row): array => [
                    'worker_code' => $row->worker->worker_code,
                    'name' => $row->worker->name,
                    'job_type' => $row->worker->job_type->value,
                    'division' => $row->worker->division->code,
                    'lot_count' => (int) $row->getAttribute('lot_count'),
                    'total_sacks' => (int) $row->getAttribute('total_sacks'),
                    'total_net_kg' => round((float) $row->getAttribute('total_net_kg'), 2),
                ])
                ->values()
                ->all();

            return (string) json_encode([
                'worker_count' => count($rows),
                'ranking' => $rows,
            ], JSON_UNESCAPED_UNICODE);
        }

        $workers = Worker::query()
            ->with('division')
            ->whereIn('id', $pivotStats->pluck('worker_id')->all())
            ->get()
            ->keyBy('id');

        $rows = $pivotStats->map(function (object $stat) use ($workers): ?array {
            /** @var Worker|null $worker */
            $worker = $workers->get((int) $stat->worker_id);
            if (! $worker) {
                return null;
            }

            return [
                'worker_code' => $worker->worker_code,
                'name' => $worker->name,
                'job_type' => $worker->job_type->value,
                'division' => $worker->division->code,
                'lot_count' => (int) $stat->lot_count,
                'total_sacks' => (int) $stat->total_sacks,
                'total_net_kg' => round((float) $stat->total_net_kg, 2),
            ];
        })->filter()->values()->all();

        return (string) json_encode([
            'worker_count' => count($rows),
            'ranking' => $rows,
        ], JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'limit' => $schema->integer()->description('Jumlah pekerja teratas yang diambil, default 10.'),
            'division_id' => $schema->integer()->description('Opsional ID divisi untuk filter.'),
        ];
    }
}
