<?php

namespace App\Http\Controllers;

use App\Enums\DeliveryStatus;
use App\Enums\TransportStatus;
use App\Models\DeliveryOrder;
use App\Models\Division;
use App\Models\TphHarvestRecord;
use App\Services\AiInsightService;
use App\Services\RestanAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly AiInsightService $aiInsightService,
        private readonly RestanAnalyticsService $restanService,
    ) {}

    public function index(Request $request): Response
    {
        $divisionId = $request->integer('division_id') ?: null;
        $analytics = $this->restanService->computeSummary($divisionId);

        $harvestBase = TphHarvestRecord::query()
            ->when($divisionId, fn ($q) => $q->where('division_id', $divisionId));

        $totalLots = $analytics['total_lots'];
        $totalSacks = $analytics['total_sacks'];
        $totalNetKg = $analytics['total_net_kg'];
        $remainingSacksAtTph = $analytics['remaining_sacks'];
        $pendingRestanLots = $analytics['pending_restan_lots'];
        $cumulativeRestanDays = $analytics['cumulative_restan_days'];

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
            ->with(['division', 'block', 'blocks', 'tphPoint', 'worker', 'workers', 'recorder', 'weigher'])
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
                'max_restan_days' => $analytics['max_restan_days'],
                'pending_restan_lots' => $pendingRestanLots,
                'aged_restan_lots' => $analytics['aged_restan_lots'],
                'pending_station_count' => $analytics['pending_station_count'],
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
