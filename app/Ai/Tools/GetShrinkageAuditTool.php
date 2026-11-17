<?php

namespace App\Ai\Tools;

use App\Models\DeliveryOrder;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetShrinkageAuditTool implements Tool
{
    public function description(): Stringable|string
    {
        return 'Menganalisis rekonsiliasi timbangan kebun vs jembatan timbang PKS pada Surat Jalan (SPB) yang sudah ditimbang PKS beserta persentase selisih susut berat.';
    }

    public function handle(Request $request): Stringable|string
    {
        $thresholdPercent = isset($request['threshold_percent']) ? (float) $request['threshold_percent'] : 2.0;
        $divisionId = isset($request['division_id']) ? (int) $request['division_id'] : null;

        $orders = DeliveryOrder::query()
            ->with(['division', 'truck', 'pksMill'])
            ->whereNotNull('pks_net_weight_kg')
            ->when($divisionId !== null && $divisionId > 0, fn ($q) => $q->where('division_id', $divisionId))
            ->orderByDesc('arrived_at')
            ->limit(25)
            ->get();

        $rows = $orders->map(function (DeliveryOrder $order) use ($thresholdPercent): array {
            $estimated = max(0.01, $order->total_estimated_kg);
            $shrinkage = (float) ($order->weight_shrinkage_kg ?? 0);
            $percent = round(($shrinkage / $estimated) * 100, 2);

            return [
                'spb_number' => $order->spb_number,
                'division' => $order->division->code,
                'plate_number' => $order->truck->plate_number,
                'driver_name' => $order->truck->driver_name,
                'pks_mill' => $order->pksMill->name,
                'pks_ticket_number' => $order->pks_ticket_number,
                'estimated_kg' => $order->total_estimated_kg,
                'pks_net_weight_kg' => $order->pks_net_weight_kg,
                'shrinkage_kg' => $shrinkage,
                'shrinkage_percent' => $percent,
                'is_anomaly' => abs($percent) > $thresholdPercent,
            ];
        })->values()->all();

        $totalEstimated = array_sum(array_column($rows, 'estimated_kg'));
        $totalPks = array_sum(array_column($rows, 'pks_net_weight_kg'));
        $totalShrinkage = round($totalEstimated - $totalPks, 2);

        return (string) json_encode([
            'spb_count' => count($rows),
            'total_estimated_kg' => round($totalEstimated, 2),
            'total_pks_kg' => round($totalPks, 2),
            'total_shrinkage_kg' => $totalShrinkage,
            'average_shrinkage_percent' => $totalEstimated > 0 ? round(($totalShrinkage / $totalEstimated) * 100, 2) : 0.0,
            'anomaly_count' => count(array_filter($rows, fn (array $r): bool => $r['is_anomaly'])),
            'records' => $rows,
        ], JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'threshold_percent' => $schema->number()->description('Ambang batas persentase susut anomali, default 2.0 persen.'),
            'division_id' => $schema->integer()->description('Opsional ID divisi untuk filter.'),
        ];
    }
}
