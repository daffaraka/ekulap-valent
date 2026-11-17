<?php

namespace App\Ai\Tools;

use App\Models\TphHarvestRecord;
use App\Services\GpsDistanceService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetGpsDeviationAuditTool implements Tool
{
    public function description(): Stringable|string
    {
        return 'Memeriksa catatan timbang TPH yang titik GPS HP pencatatnya menyimpang melebihi batas jarak aman dari koordinat master Titik TPH.';
    }

    public function handle(Request $request): Stringable|string
    {
        $maxMeters = isset($request['max_meters'])
            ? (float) $request['max_meters']
            : GpsDistanceService::DEFAULT_MAX_TOLERANCE_METERS;
        $divisionId = isset($request['division_id']) ? (int) $request['division_id'] : null;

        $flagged = TphHarvestRecord::query()
            ->with(['tphPoint', 'block', 'division', 'recorder'])
            ->whereNotNull('gps_distance_meters')
            ->where('gps_distance_meters', '>', $maxMeters)
            ->when($divisionId !== null && $divisionId > 0, fn ($q) => $q->where('division_id', $divisionId))
            ->orderByDesc('gps_distance_meters')
            ->limit(20)
            ->get()
            ->map(fn (TphHarvestRecord $record): array => [
                'lot_number' => $record->lot_number,
                'work_date' => $record->work_date->toDateString(),
                'division' => $record->division->code,
                'tph_code' => $record->tphPoint->code,
                'recorder' => $record->recorder->name,
                'gps_distance_meters' => $record->gps_distance_meters,
            ])
            ->values()
            ->all();

        return (string) json_encode([
            'max_tolerance_meters' => $maxMeters,
            'flagged_count' => count($flagged),
            'flagged_records' => $flagged,
        ], JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'max_meters' => $schema->number()->description('Batas toleransi jarak GPS dalam meter, default 100 meter.'),
            'division_id' => $schema->integer()->description('Opsional ID divisi untuk filter.'),
        ];
    }
}
