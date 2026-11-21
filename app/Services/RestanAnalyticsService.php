<?php

namespace App\Services;

use App\Enums\DeliveryStatus;
use App\Models\TphHarvestRecord;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class RestanAnalyticsService
{
    public function restanDaysForDate(CarbonInterface $workDate, ?CarbonInterface $referenceDate = null): int
    {
        $todayStart = ($referenceDate ?? now())->startOfDay();

        return max(0, (int) $workDate->startOfDay()->diffInDays($todayStart, false));
    }

    /**
     * @return array{
     *     total_lots: int,
     *     total_sacks: int,
     *     total_net_kg: float,
     *     remaining_sacks: int,
     *     unloaded_sacks_at_tph: int,
     *     belum_muat_spb_sacks: int,
     *     pending_restan_lots: int,
     *     aged_restan_lots: int,
     *     today_restan_lots: int,
     *     max_restan_days: int,
     *     cumulative_restan_days: int,
     *     pending_station_count: int,
     *     station_recap: list<array<string, mixed>>,
     * }
     */
    public function computeSummary(?int $divisionId = null, ?string $upToDate = null, ?string $fromDate = null): array
    {
        $todayStart = now()->startOfDay();

        $records = TphHarvestRecord::query()
            ->with([
                'division',
                'block',
                'blocks',
                'tphPoint',
                'worker',
                'workers',
                'weigher',
                'recorder',
                'deliveryOrderItems.deliveryOrder',
            ])
            ->when($divisionId, fn ($q) => $q->where('division_id', $divisionId))
            ->when($fromDate !== null && $fromDate !== '', fn ($q) => $q->whereDate('work_date', '>=', $fromDate))
            ->when($upToDate !== null && $upToDate !== '', fn ($q) => $q->whereDate('work_date', '<=', $upToDate))
            ->orderBy('work_date')
            ->orderBy('id')
            ->get();

        $totalLots = $records->count();
        $totalSacks = (int) $records->sum('sack_count');
        $totalNetKg = round((float) $records->sum('net_weight_kg'), 2);

        $unloadedTotal = 0;
        $belumMuatTotal = 0;
        $pendingLots = [];

        foreach ($records as $record) {
            $unloadedSacks = max(0, $record->sack_count - $record->loaded_sack_count);
            $belumMuatSacks = $this->belumMuatSpbSacksForRecord($record);
            $restanSacks = min($record->sack_count, $unloadedSacks + $belumMuatSacks);

            $unloadedTotal += $unloadedSacks;
            $belumMuatTotal += $belumMuatSacks;

            if ($restanSacks <= 0) {
                continue;
            }

            $restanDays = $this->restanDaysForDate($record->work_date, $todayStart);
            $ratio = $record->sack_count > 0 ? ($restanSacks / $record->sack_count) : 0.0;
            $restanNetKg = round($record->net_weight_kg * $ratio, 2);

            $blockCodesList = $record->resolvedBlockCodesList();
            $workerNamesList = $record->resolvedWorkerNamesList();
            $workerNames = implode(', ', $workerNamesList);
            $weigherName = $record->resolvedWeigherName();

            $pendingLots[] = [
                'id' => $record->id,
                'lot_number' => $record->lot_number,
                'work_date' => $record->work_date->toDateString(),
                'division_code' => $record->division->code,
                'block_code' => $record->formattedBlockCodes(),
                'block_codes_list' => $blockCodesList,
                'tph_point_id' => $record->tph_point_id,
                'tph_code' => $record->tphPoint->code,
                'location_label' => $record->tphPoint->location_label,
                'harvest_type' => $record->harvest_type->value,
                'worker_names' => $workerNames !== '' ? $workerNames : '-',
                'worker_names_list' => $workerNamesList,
                'weigher_name' => $weigherName,
                'sack_count' => $record->sack_count,
                'unloaded_sacks' => $unloadedSacks,
                'belum_muat_sacks' => $belumMuatSacks,
                'restan_sacks' => $restanSacks,
                'restan_net_kg' => $restanNetKg,
                'restan_days' => $restanDays,
                'transport_status' => $record->transport_status->value,
            ];
        }

        $pendingCollection = collect($pendingLots);
        $agedLots = $pendingCollection->where('restan_days', '>', 0)->count();
        $todayLots = $pendingCollection->where('restan_days', '=', 0)->count();
        $maxRestanDays = (int) ($pendingCollection->max('restan_days') ?? 0);
        $cumulativeRestanDays = (int) $pendingCollection->sum('restan_days');

        $stationRecap = $this->groupByStation($pendingLots);

        return [
            'total_lots' => $totalLots,
            'total_sacks' => $totalSacks,
            'total_net_kg' => $totalNetKg,
            'remaining_sacks' => $unloadedTotal + $belumMuatTotal,
            'unloaded_sacks_at_tph' => $unloadedTotal,
            'belum_muat_spb_sacks' => $belumMuatTotal,
            'pending_restan_lots' => $pendingCollection->count(),
            'aged_restan_lots' => $agedLots,
            'today_restan_lots' => $todayLots,
            'max_restan_days' => $maxRestanDays,
            'cumulative_restan_days' => $cumulativeRestanDays,
            'pending_station_count' => count($stationRecap),
            'station_recap' => $stationRecap,
        ];
    }

    public function belumMuatSpbSacksForRecord(TphHarvestRecord $record): int
    {
        $total = 0;

        foreach ($record->deliveryOrderItems as $item) {
            if ($item->deliveryOrder->delivery_status === DeliveryStatus::BelumMuat) {
                $total += $item->loaded_sacks;
            }
        }

        return $total;
    }

    /**
     * @param  list<array<string, mixed>>  $pendingLots
     * @return list<array<string, mixed>>
     */
    private function groupByStation(array $pendingLots): array
    {
        $grouped = collect($pendingLots)
            ->groupBy(fn (array $item): int => (int) $item['tph_point_id'])
            ->map(function (Collection $lots, int $tphPointId): array {
                $first = $lots->first();
                $ageBuckets = $lots
                    ->groupBy(fn (array $item): int => (int) $item['restan_days'])
                    ->map(fn (Collection $bucket, int $days): array => [
                        'days' => $days,
                        'sacks' => (int) $bucket->sum('restan_sacks'),
                        'lot_count' => $bucket->count(),
                    ])
                    ->sortByDesc('days')
                    ->values()
                    ->all();

                $blockCodes = $lots
                    ->flatMap(static fn (array $item): array => is_array($item['block_codes_list'] ?? null) ? $item['block_codes_list'] : [])
                    ->filter(static fn (mixed $code): bool => is_string($code) && trim($code) !== '')
                    ->unique()
                    ->values()
                    ->all();

                $workerNames = $lots
                    ->flatMap(static fn (array $item): array => is_array($item['worker_names_list'] ?? null) ? $item['worker_names_list'] : [])
                    ->filter(static fn (mixed $name): bool => is_string($name) && trim($name) !== '')
                    ->unique()
                    ->values()
                    ->all();

                $weigherNames = $lots
                    ->pluck('weigher_name')
                    ->filter(static fn (mixed $name): bool => is_string($name) && trim($name) !== '' && $name !== '-')
                    ->unique()
                    ->values()
                    ->all();

                $sortedLots = $lots
                    ->sortByDesc('restan_days')
                    ->map(static function (array $item): array {
                        unset($item['worker_names_list'], $item['block_codes_list']);

                        return $item;
                    })
                    ->values()
                    ->all();

                return [
                    'tph_point_id' => $tphPointId,
                    'tph_code' => (string) ($first['tph_code'] ?? '-'),
                    'location_label' => (string) ($first['location_label'] ?? '-'),
                    'division_codes' => $lots->pluck('division_code')->unique()->values()->all(),
                    'block_codes' => $blockCodes,
                    'worker_names' => $workerNames,
                    'weigher_names' => $weigherNames,
                    'lot_count' => $lots->count(),
                    'restan_sacks' => (int) $lots->sum('restan_sacks'),
                    'unloaded_sacks' => (int) $lots->sum('unloaded_sacks'),
                    'belum_muat_sacks' => (int) $lots->sum('belum_muat_sacks'),
                    'restan_net_kg' => round((float) $lots->sum('restan_net_kg'), 2),
                    'oldest_work_date' => (string) $lots->min('work_date'),
                    'max_restan_days' => (int) ($lots->max('restan_days') ?? 0),
                    'age_breakdown' => $ageBuckets,
                    'records' => $sortedLots,
                ];
            })
            ->sort(function (array $a, array $b): int {
                $daysCmp = (int) $b['max_restan_days'] <=> (int) $a['max_restan_days'];
                if ($daysCmp !== 0) {
                    return $daysCmp;
                }

                return (int) $b['restan_sacks'] <=> (int) $a['restan_sacks'];
            })
            ->values()
            ->all();

        return array_values($grouped);
    }
}
