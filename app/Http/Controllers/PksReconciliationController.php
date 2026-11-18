<?php

namespace App\Http\Controllers;

use App\Enums\DeliveryStatus;
use App\Http\Requests\Ekulap\RecordPksWeighingRequest;
use App\Models\DeliveryOrder;
use App\Models\User;
use App\Services\AuditLoggerService;
use App\Services\HarvestLoadingService;
use App\Services\ImageCompressionService;
use App\Services\RestanAnalyticsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PksReconciliationController extends Controller
{
    public function __construct(
        private readonly HarvestLoadingService $loadingService,
        private readonly ImageCompressionService $imageCompressionService,
        private readonly AuditLoggerService $auditLogger,
        private readonly RestanAnalyticsService $restanService,
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

        $analytics = $this->restanService->computeSummary(null, $today->toDateString());
        $totalSacksAll = $analytics['total_sacks'];
        $waitingSacksToPks = $analytics['remaining_sacks'];
        $totalEstimatedKg = round((float) DeliveryOrder::query()->sum('total_estimated_kg'), 2);
        $unsentDays = $analytics['cumulative_restan_days'];
        $totalRestanSdHi = $waitingSacksToPks;

        $restanPercentage = $totalSacksAll > 0
            ? round(($totalRestanSdHi / $totalSacksAll) * 100, 1)
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
                'today_sent_percentage' => $restanPercentage,
                'today_sent_sacks' => $totalRestanSdHi,
                'today_total_sacks' => $totalSacksAll,
            ],
            'deliveryStatuses' => DeliveryStatus::values(),
        ]);
    }

    public function weigh(RecordPksWeighingRequest $request, DeliveryOrder $deliveryOrder): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('pks_slip_photo')) {
            $file = $request->file('pks_slip_photo');
            if ($file !== null) {
                $validated['pks_slip_photo_path'] = $this->imageCompressionService->storeCompressedImage($file, 'pks-slips');
            }
        }

        $order = $this->loadingService->recordPksWeighing($deliveryOrder, $validated);

        $shrinkagePct = $order->total_estimated_kg > 0 && $order->weight_shrinkage_kg !== null
            ? round(($order->weight_shrinkage_kg / $order->total_estimated_kg) * 100, 2)
            : 0.0;
        $actor = $request->user();
        $actorName = $actor instanceof User ? $actor->name : 'Checker PKS';
        $severity = $shrinkagePct > 2.0 ? 'warning' : 'normal';

        $this->auditLogger->log(
            category: 'pks',
            action: 'weighed',
            humanMessage: "{$actorName} mencatat timbang PKS tiket {$order->pks_ticket_number} untuk {$order->spb_number} (Netto PKS {$order->pks_net_weight_kg} kg, susut {$order->weight_shrinkage_kg} kg / {$shrinkagePct}%).",
            severity: $severity,
            subject: $order,
            actor: $actor instanceof User ? $actor : null,
            fallbackActorName: $actorName,
        );

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
