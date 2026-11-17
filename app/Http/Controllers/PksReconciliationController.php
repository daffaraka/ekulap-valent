<?php

namespace App\Http\Controllers;

use App\Enums\DeliveryStatus;
use App\Enums\TransportStatus;
use App\Http\Requests\Ekulap\RecordPksWeighingRequest;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderItem;
use App\Models\TphHarvestRecord;
use App\Services\HarvestLoadingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PksReconciliationController extends Controller
{
    public function __construct(
        private readonly HarvestLoadingService $loadingService,
    ) {}

    public function index(Request $request): Response
    {
        $status = trim((string) $request->string('status'));
        $today = now()->startOfDay();

        $orders = DeliveryOrder::query()
            ->with(['division', 'truck', 'pksMill', 'loader', 'items.harvestRecord.worker', 'items.harvestRecord.workers'])
            ->when($status !== '', fn ($q) => $q->where('delivery_status', $status))
            ->orderByRaw('CASE WHEN pks_net_weight_kg IS NULL THEN 0 ELSE 1 END')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        $totalSacksAll = (int) TphHarvestRecord::query()->sum('sack_count');
        $totalLoadedAll = (int) TphHarvestRecord::query()->sum('loaded_sack_count');
        $unloadedSacksAtTph = max(0, $totalSacksAll - $totalLoadedAll);
        $belumMuatSpbSacks = (int) DeliveryOrder::query()
            ->where('delivery_status', DeliveryStatus::BelumMuat->value)
            ->sum('total_sacks_loaded');
        $waitingSacksToPks = $unloadedSacksAtTph + $belumMuatSpbSacks;

        $totalEstimatedKg = round((float) DeliveryOrder::query()->sum('total_estimated_kg'), 2);

        $unsentLots = TphHarvestRecord::query()
            ->whereIn('transport_status', [
                TransportStatus::BelumDiangkut->value,
                TransportStatus::DiangkutSebagian->value,
            ])
            ->get(['id', 'work_date']);

        $unsentDays = (int) $unsentLots->sum(
            fn (TphHarvestRecord $record): int => max(
                0,
                (int) $record->work_date->startOfDay()->diffInDays($today),
            ),
        );

        $todayTotalSacks = (int) TphHarvestRecord::query()
            ->whereDate('work_date', $today->toDateString())
            ->sum('sack_count');

        $todaySentSacks = (int) DeliveryOrderItem::query()
            ->whereHas('harvestRecord', fn ($q) => $q->whereDate('work_date', $today->toDateString()))
            ->whereHas('deliveryOrder', fn ($q) => $q->where('delivery_status', DeliveryStatus::SudahDikirim->value))
            ->sum('loaded_sacks');

        $todaySentPercentage = $todayTotalSacks > 0
            ? round(min(100.0, ($todaySentSacks / $todayTotalSacks) * 100), 1)
            : 0.0;

        return Inertia::render('pks-reconciliation/PksReconciliationIndex', [
            'orders' => $orders,
            'filters' => [
                'status' => $status,
            ],
            'summary' => [
                'waiting_sacks_to_pks' => $waitingSacksToPks,
                'total_estimated_kg' => $totalEstimatedKg,
                'unsent_days' => $unsentDays,
                'today_sent_percentage' => $todaySentPercentage,
                'today_sent_sacks' => $todaySentSacks,
                'today_total_sacks' => $todayTotalSacks,
            ],
            'deliveryStatuses' => DeliveryStatus::values(),
        ]);
    }

    public function weigh(RecordPksWeighingRequest $request, DeliveryOrder $deliveryOrder): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('pks_slip_photo')) {
            $validated['pks_slip_photo_path'] = $request->file('pks_slip_photo')?->store('pks-slips', 'public');
        }

        $order = $this->loadingService->recordPksWeighing($deliveryOrder, $validated);

        return redirect()
            ->route('pks-reconciliation.index')
            ->with('success', "Timbangan PKS untuk {$order->spb_number} tercatat ({$order->pks_net_weight_kg} Kg, susut {$order->weight_shrinkage_kg} Kg).");
    }

    public function exportCsv(): StreamedResponse
    {
        $orders = DeliveryOrder::query()
            ->with(['division', 'truck', 'pksMill', 'loader'])
            ->orderByDesc('id')
            ->get();

        return response()->streamDownload(function () use ($orders): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'Nomor Surat Jalan (SPB)',
                'Divisi Asal',
                'Nomor Polisi Truk',
                'Nama Supir',
                'PKS Tujuan',
                'Keterangan SPB',
                'Petugas Muat',
                'Total Karung',
                'Estimasi Kebun (Kg)',
                'Nomor Tiket PKS',
                'Berat Bersih PKS (Kg)',
                'Selisih Susut (Kg)',
                'Status Pengiriman',
                'Jam Berangkat',
                'Jam Tiba PKS',
            ]);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->spb_number,
                    $order->division->code.' - '.$order->division->name,
                    $order->truck->plate_number,
                    $order->truck->driver_name,
                    $order->pksMill->name,
                    $order->notes ?? '-',
                    $order->loader->name,
                    $order->total_sacks_loaded,
                    $order->total_estimated_kg,
                    $order->pks_ticket_number ?? '-',
                    $order->pks_net_weight_kg ?? '-',
                    $order->weight_shrinkage_kg ?? '-',
                    $order->delivery_status->value,
                    $order->departed_at?->format('Y-m-d H:i') ?? '-',
                    $order->arrived_at?->format('Y-m-d H:i') ?? '-',
                ]);
            }

            fclose($handle);
        }, 'status-kutip-lapis-ekulap.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
