<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\TphHarvestRecord;
use App\Services\RestanAnalyticsService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RekapanController extends Controller
{
    public function __construct(
        private readonly RestanAnalyticsService $restanService,
    ) {}

    public function index(Request $request): Response
    {
        $dateFrom = trim((string) $request->string('date_from'));
        $dateTo = trim((string) $request->string('date_to'));
        $divisionId = $request->integer('division_id') ?: null;
        $activeTab = trim((string) $request->string('tab', 'daily'));
        if (! in_array($activeTab, ['daily', 'station'], true)) {
            $activeTab = 'daily';
        }

        $records = $this->buildFilteredQuery($dateFrom, $dateTo, $divisionId)->get();
        $dailyRows = $this->groupDailyRecap($records);
        $analytics = $this->restanService->computeSummary($divisionId, $dateTo !== '' ? $dateTo : null, $dateFrom !== '' ? $dateFrom : null);

        $totals = [
            'days_count' => count($dailyRows),
            'lot_count' => $records->count(),
            'tph_count' => (int) $records->sum('tph_count'),
            'total_sacks' => (int) $records->sum('sack_count'),
            'total_net_kg' => round((float) $records->sum('net_weight_kg'), 2),
            'loaded_sacks' => (int) $records->sum('loaded_sack_count'),
            'remaining_sacks' => $analytics['remaining_sacks'],
            'belum_muat_spb_sacks' => $analytics['belum_muat_spb_sacks'],
            'max_restan_days' => $analytics['max_restan_days'],
            'cumulative_restan_days' => $analytics['cumulative_restan_days'],
            'pending_station_count' => $analytics['pending_station_count'],
        ];

        return Inertia::render('rekapan/RekapanIndex', [
            'dailyRows' => $dailyRows,
            'stationRows' => $analytics['station_recap'],
            'totals' => $totals,
            'filters' => [
                'tab' => $activeTab,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'division_id' => $divisionId,
            ],
            'divisions' => Division::query()->orderBy('code')->get(['id', 'code', 'name']),
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $dateFrom = trim((string) $request->string('date_from'));
        $dateTo = trim((string) $request->string('date_to'));
        $divisionId = $request->integer('division_id') ?: null;
        $tab = trim((string) $request->string('tab', 'daily'));

        if ($tab === 'station') {
            $analytics = $this->restanService->computeSummary($divisionId, $dateTo !== '' ? $dateTo : null, $dateFrom !== '' ? $dateFrom : null);

            return $this->streamStationCsv($analytics['station_recap']);
        }

        $records = $this->buildFilteredQuery($dateFrom, $dateTo, $divisionId)->get();
        $dailyRows = $this->groupDailyRecap($records);

        return response()->streamDownload(function () use ($dailyRows): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'Tanggal Kerja',
                'Divisi',
                'Blok',
                'Jumlah Lot',
                'Jumlah TPH',
                'Total Karung',
                'Total Berat (Kg)',
                'Sudah Muat/Kirim (Karung)',
                'Sisa Restan (Karung)',
                'Umur Restan (Hari)',
            ]);

            foreach ($dailyRows as $row) {
                fputcsv($handle, [
                    $row['work_date'],
                    implode(', ', $row['divisions']),
                    implode(', ', $row['blocks']),
                    $row['lot_count'],
                    $row['tph_count'],
                    $row['total_sacks'],
                    $row['total_net_kg'],
                    $row['loaded_sacks'],
                    $row['remaining_sacks'],
                    $row['restan_days'],
                ]);
            }

            fclose($handle);
        }, 'rekapan-kutip-lapis-ekulap.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @param  list<array<string, mixed>>  $stationRows
     */
    private function streamStationCsv(array $stationRows): StreamedResponse
    {
        return response()->streamDownload(function () use ($stationRows): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'Stasiun TPH',
                'Lokasi',
                'Divisi',
                'Blok',
                'Jumlah Lot Restan',
                'Total Restan (Karung)',
                'Masih di TPH (Karung)',
                'SPB Belum Muat (Karung)',
                'Estimasi Netto Restan (Kg)',
                'Tanggal Panen Tertua',
                'Restan Terlama (Hari)',
            ]);

            foreach ($stationRows as $row) {
                fputcsv($handle, [
                    $row['tph_code'],
                    $row['location_label'],
                    implode(', ', $row['division_codes']),
                    implode(', ', $row['block_codes']),
                    $row['lot_count'],
                    $row['restan_sacks'],
                    $row['unloaded_sacks'],
                    $row['belum_muat_sacks'],
                    $row['restan_net_kg'],
                    $row['oldest_work_date'],
                    $row['max_restan_days'],
                ]);
            }

            fclose($handle);
        }, 'rekapan-restan-stasiun-ekulap.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return Builder<TphHarvestRecord>
     */
    private function buildFilteredQuery(string $dateFrom, string $dateTo, ?int $divisionId): Builder
    {
        return TphHarvestRecord::query()
            ->with(['division', 'block', 'tphPoint', 'worker', 'workers', 'weigher', 'recorder', 'deliveryOrderItems.deliveryOrder'])
            ->when($dateFrom !== '', fn ($q) => $q->whereDate('work_date', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($q) => $q->whereDate('work_date', '<=', $dateTo))
            ->when($divisionId, fn ($q) => $q->where('division_id', $divisionId))
            ->orderByDesc('work_date')
            ->orderByDesc('weighed_at');
    }

    /**
     * @param  Collection<int, TphHarvestRecord>  $records
     * @return list<array<string, mixed>>
     */
    private function groupDailyRecap(Collection $records): array
    {
        $todayStart = now()->startOfDay();

        return array_values(
            $records
                ->groupBy(fn (TphHarvestRecord $record): string => $record->work_date->toDateString())
                ->map(function (Collection $dayRecords, string $workDate) use ($todayStart): array {
                    $totalSacks = (int) $dayRecords->sum('sack_count');
                    $loadedSacks = (int) $dayRecords->sum('loaded_sack_count');

                    $detailRecords = $dayRecords->map(function (TphHarvestRecord $record) use ($todayStart): array {
                        $workerNames = $record->workers->pluck('name')->implode(', ');
                        $belumMuat = $this->restanService->belumMuatSpbSacksForRecord($record);
                        $restanSacks = min($record->sack_count, $record->remainingSacks() + $belumMuat);
                        $restanDays = $restanSacks > 0
                            ? $this->restanService->restanDaysForDate($record->work_date, $todayStart)
                            : 0;

                        return [
                            'id' => $record->id,
                            'lot_number' => $record->lot_number,
                            'division_code' => $record->division->code,
                            'block_code' => $record->block->code,
                            'tph_code' => $record->tphPoint->code,
                            'harvest_type' => $record->harvest_type->value,
                            'worker_names' => $workerNames !== '' ? $workerNames : $record->worker->name,
                            'weigher_name' => $record->weigher_user_id !== null ? $record->weigher->name : $record->recorder->name,
                            'sack_count' => $record->sack_count,
                            'tph_count' => $record->tph_count,
                            'net_weight_kg' => $record->net_weight_kg,
                            'loaded_sack_count' => $record->loaded_sack_count,
                            'remaining_sacks' => $restanSacks,
                            'restan_days' => $restanDays,
                            'transport_status' => $record->transport_status->value,
                        ];
                    })->values()->all();

                    $remainingSacks = (int) collect($detailRecords)->sum('remaining_sacks');
                    $firstRecord = $dayRecords->first();
                    $dayRestanDays = $remainingSacks > 0 && $firstRecord !== null
                        ? $this->restanService->restanDaysForDate($firstRecord->work_date, $todayStart)
                        : 0;

                    return [
                        'work_date' => $workDate,
                        'lot_count' => $dayRecords->count(),
                        'tph_count' => (int) $dayRecords->sum('tph_count'),
                        'total_sacks' => $totalSacks,
                        'total_net_kg' => round((float) $dayRecords->sum('net_weight_kg'), 2),
                        'loaded_sacks' => $loadedSacks,
                        'remaining_sacks' => $remainingSacks,
                        'restan_days' => $dayRestanDays,
                        'divisions' => $dayRecords->pluck('division.code')->unique()->values()->all(),
                        'blocks' => $dayRecords->pluck('block.code')->unique()->values()->all(),
                        'records' => $detailRecords,
                    ];
                })
                ->values()
                ->all()
        );
    }
}
