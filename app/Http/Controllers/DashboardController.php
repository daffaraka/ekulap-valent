<?php

namespace App\Http\Controllers;

use App\Enums\DeliveryStatus;
use App\Enums\TransportStatus;
use App\Models\DeliveryOrder;
use App\Models\Division;
use App\Models\TphHarvestRecord;
use App\Services\AiInsightService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly AiInsightService $aiInsightService,
    ) {}

    public function index(Request $request): Response
    {
        $divisionId = $request->integer('division_id') ?: null;
        $todayStart = now()->startOfDay();

        $harvestBase = TphHarvestRecord::query()
            ->when($divisionId, fn ($q) => $q->where('division_id', $divisionId));

        $totalLots = (clone $harvestBase)->count();
        $totalSacks = (int) (clone $harvestBase)->sum('sack_count');
        $totalNetKg = round((float) (clone $harvestBase)->sum('net_weight_kg'), 2);
        $totalLoadedSacks = (int) (clone $harvestBase)->sum('loaded_sack_count');
        $remainingSacksAtTph = max(0, $totalSacks - $totalLoadedSacks);

        $pendingRestanRecords = (clone $harvestBase)
            ->whereIn('transport_status', [
                TransportStatus::BelumDiangkut->value,
                TransportStatus::DiangkutSebagian->value,
            ])
            ->get(['id', 'work_date', 'sack_count', 'loaded_sack_count']);

        $pendingRestanLots = $pendingRestanRecords->count();
        $cumulativeRestanDays = (int) $pendingRestanRecords->sum(
            fn (TphHarvestRecord $record): int => max(
                0,
                (int) $record->work_date->startOfDay()->diffInDays($todayStart),
            ),
        );

        $chartStatuses = [
            TransportStatus::BelumDiangkut,
            TransportStatus::DiangkutSebagian,
            TransportStatus::SudahDiangkut,
        ];

        $statusBreakdown = collect($chartStatuses)->map(function (TransportStatus $status) use ($harvestBase): array {
            $subset = (clone $harvestBase)->where('transport_status', $status->value);

            return [
                'status' => $status->value,
                'lot_count' => $subset->count(),
                'sack_count' => (int) $subset->sum('sack_count'),
                'net_weight_kg' => round((float) $subset->sum('net_weight_kg'), 2),
            ];
        })->values()->all();

        $chartTotalSacks = (int) array_sum(array_column($statusBreakdown, 'sack_count'));

        $deliveryBase = DeliveryOrder::query()
            ->when($divisionId, fn ($q) => $q->where('division_id', $divisionId));

        $activeSpbCount = (clone $deliveryBase)
            ->where(function ($query): void {
                $query->where('delivery_status', DeliveryStatus::BelumMuat->value)
                    ->orWhereNull('pks_net_weight_kg');
            })
            ->count();

        $recentHarvests = (clone $harvestBase)
            ->with(['division', 'block', 'tphPoint', 'worker', 'workers', 'recorder', 'weigher'])
            ->orderByDesc('weighed_at')
            ->limit(6)
            ->get();

        $recentDeliveries = (clone $deliveryBase)
            ->with(['division', 'truck', 'pksMill'])
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard/DashboardOverview', [
            'filters' => [
                'division_id' => $divisionId,
            ],
            'divisions' => Division::query()->orderBy('code')->get(['id', 'code', 'name']),
            'kpis' => [
                'total_lots' => $totalLots,
                'total_sacks' => $totalSacks,
                'total_net_kg' => $totalNetKg,
                'remaining_sacks_at_tph' => $remainingSacksAtTph,
                'active_spb_count' => $activeSpbCount,
                'cumulative_restan_days' => $cumulativeRestanDays,
                'pending_restan_lots' => $pendingRestanLots,
            ],
            'statusBreakdown' => $statusBreakdown,
            'chartTotalSacks' => $chartTotalSacks,
            // Disimpan sementara (perbandingan estimasi kebun vs netto dikomentari sesuai revisi)
            'pksComparison' => [],
            'recentHarvests' => $recentHarvests,
            'recentDeliveries' => $recentDeliveries,
            'aiSnapshot' => $this->aiInsightService->getOperationalSnapshot($divisionId),
        ]);
    }
}
