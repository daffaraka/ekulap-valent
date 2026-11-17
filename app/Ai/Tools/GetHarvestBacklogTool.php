<?php

namespace App\Ai\Tools;

use App\Enums\TransportStatus;
use App\Models\TphHarvestRecord;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetHarvestBacklogTool implements Tool
{
    public function description(): Stringable|string
    {
        return 'Mengambil rekap lot hasil panen & brondolan di TPH yang berstatus Belum Diangkut atau Diangkut Sebagian (restan), termasuk jumlah sisa karung dan estimasi Kg.';
    }

    public function handle(Request $request): Stringable|string
    {
        $divisionCode = isset($request['division_code']) ? trim((string) $request['division_code']) : '';
        $divisionId = isset($request['division_id']) ? (int) $request['division_id'] : null;

        $query = TphHarvestRecord::query()
            ->with(['division', 'block', 'tphPoint', 'worker', 'workers'])
            ->whereIn('transport_status', [
                TransportStatus::BelumDiangkut->value,
                TransportStatus::DiangkutSebagian->value,
            ])
            ->orderBy('weighed_at');

        if ($divisionCode !== '') {
            $query->whereHas('division', fn ($q) => $q->where('code', $divisionCode));
        }

        if ($divisionId !== null && $divisionId > 0) {
            $query->where('division_id', $divisionId);
        }

        $records = $query->get();

        $lots = $records->map(function (TphHarvestRecord $record): array {
            $remainingSacks = $record->remainingSacks();
            $remainingKg = $record->sack_count > 0
                ? round(($record->net_weight_kg / $record->sack_count) * $remainingSacks, 2)
                : 0.0;
            $workerNames = $record->workers->pluck('name')->implode(', ');

            return [
                'lot_number' => $record->lot_number,
                'work_date' => $record->work_date->toDateString(),
                'division' => $record->division->code,
                'block' => $record->block->code,
                'tph_code' => $record->tphPoint->code,
                'worker' => $workerNames !== '' ? $workerNames : $record->worker->name,
                'harvest_type' => $record->harvest_type->value,
                'status' => $record->transport_status->value,
                'total_sacks' => $record->sack_count,
                'loaded_sacks' => $record->loaded_sack_count,
                'remaining_sacks' => $remainingSacks,
                'remaining_kg' => $remainingKg,
            ];
        })->values()->all();

        $summary = [
            'pending_lot_count' => count($lots),
            'total_remaining_sacks' => array_sum(array_column($lots, 'remaining_sacks')),
            'total_remaining_kg' => round(array_sum(array_column($lots, 'remaining_kg')), 2),
            'lots' => $lots,
        ];

        return (string) json_encode($summary, JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'division_code' => $schema->string()->description('Opsional kode divisi untuk filter, misalnya DIV-IV.'),
            'division_id' => $schema->integer()->description('Opsional ID divisi untuk filter.'),
        ];
    }
}
