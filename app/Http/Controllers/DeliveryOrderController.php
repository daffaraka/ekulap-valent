<?php

namespace App\Http\Controllers;

use App\Enums\DeliveryStatus;
use App\Enums\TransportStatus;
use App\Http\Requests\Ekulap\StoreDeliveryOrderRequest;
use App\Models\DeliveryOrder;
use App\Models\Division;
use App\Models\PksMill;
use App\Models\TphHarvestRecord;
use App\Models\Truck;
use App\Models\User;
use App\Services\HarvestLoadingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryOrderController extends Controller
{
    public function __construct(
        private readonly HarvestLoadingService $loadingService,
    ) {}

    public function index(Request $request): Response
    {
        $status = trim((string) $request->string('status'));
        $search = trim((string) $request->string('search'));

        $orders = DeliveryOrder::query()
            ->with([
                'division',
                'truck',
                'pksMill',
                'loader',
                'items.harvestRecord.tphPoint',
                'items.harvestRecord.worker',
                'items.harvestRecord.workers',
            ])
            ->when($status !== '', fn ($q) => $q->where('delivery_status', $status))
            ->when($search !== '', fn ($q) => $q->where('spb_number', 'like', "%{$search}%"))
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        $availableLots = TphHarvestRecord::query()
            ->with(['division', 'block', 'tphPoint', 'worker', 'workers'])
            ->whereIn('transport_status', [
                TransportStatus::BelumDiangkut->value,
                TransportStatus::DiangkutSebagian->value,
            ])
            ->orderBy('work_date')
            ->orderBy('weighed_at')
            ->get()
            ->map(function (TphHarvestRecord $record): array {
                $remainingSacks = $record->remainingSacks();
                $workerNames = $record->workers->pluck('name')->implode(', ');
                if ($workerNames === '') {
                    $workerNames = $record->worker->name;
                }

                return [
                    'id' => $record->id,
                    'lot_number' => $record->lot_number,
                    'work_date' => $record->work_date->toDateString(),
                    'division_id' => $record->division_id,
                    'division_code' => $record->division->code,
                    'block_code' => $record->block->code,
                    'tph_code' => $record->tphPoint->code,
                    'worker_name' => $workerNames,
                    'harvest_type' => $record->harvest_type->value,
                    'sack_count' => $record->sack_count,
                    'loaded_sack_count' => $record->loaded_sack_count,
                    'remaining_sacks' => $remainingSacks,
                    'net_weight_kg' => $record->net_weight_kg,
                    'transport_status' => $record->transport_status->value,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('surat-jalan/SuratJalanIndex', [
            'orders' => $orders,
            'availableLots' => $availableLots,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'divisions' => Division::query()->orderBy('code')->get(['id', 'code', 'name']),
            'trucks' => Truck::query()->orderBy('plate_number')->get(['id', 'plate_number', 'driver_name', 'driver_phone', 'capacity_kg']),
            'pksMills' => PksMill::query()->orderBy('code')->get(['id', 'code', 'name']),
            'deliveryStatuses' => DeliveryStatus::values(),
        ]);
    }

    public function store(StoreDeliveryOrderRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validated();

        $loadingPhotoPaths = [];
        /** @var list<UploadedFile> $uploadedFiles */
        $uploadedFiles = $request->file('loading_photos', []);
        foreach ($uploadedFiles as $file) {
            $storedPath = $file->store('spb-loading-photos', 'public');
            if ($storedPath !== false) {
                $loadingPhotoPaths[] = $storedPath;
            }
        }
        $validated['loading_photo_paths'] = $loadingPhotoPaths;

        /** @var list<array{tph_harvest_record_id: int, loaded_sacks: int}> $items */
        $items = array_map(
            fn (array $row): array => [
                'tph_harvest_record_id' => (int) $row['tph_harvest_record_id'],
                'loaded_sacks' => (int) $row['loaded_sacks'],
            ],
            $validated['items'],
        );

        $order = $this->loadingService->createDeliveryOrder($validated, $items, $user);

        return redirect()
            ->route('surat-jalan.show', $order)
            ->with('success', "Surat Jalan {$order->spb_number} berhasil dibuat dengan {$order->total_sacks_loaded} karung ({$order->total_estimated_kg} Kg).");
    }

    public function show(DeliveryOrder $deliveryOrder): Response
    {
        $deliveryOrder->load([
            'division',
            'truck',
            'pksMill',
            'loader',
            'items.harvestRecord.block',
            'items.harvestRecord.tphPoint',
            'items.harvestRecord.worker',
            'items.harvestRecord.workers',
        ]);

        $availableLots = TphHarvestRecord::query()
            ->with(['tphPoint', 'worker', 'workers'])
            ->where('division_id', $deliveryOrder->division_id)
            ->whereIn('transport_status', [
                TransportStatus::BelumDiangkut->value,
                TransportStatus::DiangkutSebagian->value,
            ])
            ->get()
            ->map(function (TphHarvestRecord $r): array {
                $workerNames = $r->workers->pluck('name')->implode(', ');
                if ($workerNames === '') {
                    $workerNames = $r->worker->name;
                }

                return [
                    'id' => $r->id,
                    'lot_number' => $r->lot_number,
                    'tph_code' => $r->tphPoint->code,
                    'worker_name' => $workerNames,
                    'remaining_sacks' => $r->remainingSacks(),
                    'sack_count' => $r->sack_count,
                    'net_weight_kg' => $r->net_weight_kg,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('surat-jalan/SuratJalanDetail', [
            'order' => $deliveryOrder,
            'availableLots' => $availableLots,
        ]);
    }

    public function addItems(Request $request, DeliveryOrder $deliveryOrder): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.tph_harvest_record_id' => ['required', 'integer', 'exists:tph_harvest_records,id'],
            'items.*.loaded_sacks' => ['required', 'integer', 'min:1'],
        ]);

        /** @var list<array{tph_harvest_record_id: int, loaded_sacks: int}> $items */
        $items = array_map(
            fn (array $row): array => [
                'tph_harvest_record_id' => (int) $row['tph_harvest_record_id'],
                'loaded_sacks' => (int) $row['loaded_sacks'],
            ],
            $validated['items'],
        );

        $this->loadingService->appendItemsToDeliveryOrder($deliveryOrder, $items);

        return redirect()
            ->route('surat-jalan.show', $deliveryOrder)
            ->with('success', "Muatan tambahan berhasil dimasukkan ke {$deliveryOrder->spb_number}.");
    }

    public function dispatchOrder(Request $request, DeliveryOrder $deliveryOrder): RedirectResponse
    {
        $existingPhotos = $deliveryOrder->loading_photo_paths ?? [];
        $hasExistingPhotos = $existingPhotos !== [];

        $request->validate([
            'loading_photos' => [$hasExistingPhotos ? 'nullable' : 'required', 'array', $hasExistingPhotos ? 'min:0' : 'min:1', 'max:2'],
            'loading_photos.*' => ['required', 'image', 'max:5120'],
        ], [
            'loading_photos.required' => 'Unggah 1 atau 2 foto saat pengangkutan sebelum mengirim SPB.',
            'loading_photos.min' => 'Unggah minimal 1 foto pengangkutan SPB.',
            'loading_photos.max' => 'Maksimal 2 foto pengangkutan SPB.',
        ]);

        $photoPaths = $existingPhotos;
        if ($request->hasFile('loading_photos')) {
            $photoPaths = [];
            /** @var list<UploadedFile> $uploadedFiles */
            $uploadedFiles = $request->file('loading_photos', []);
            foreach ($uploadedFiles as $file) {
                $storedPath = $file->store('spb-loading-photos', 'public');
                if ($storedPath !== false) {
                    $photoPaths[] = $storedPath;
                }
            }
        }

        $order = $this->loadingService->dispatchDeliveryOrder($deliveryOrder, null, $photoPaths);

        return redirect()
            ->back()
            ->with('success', "SPB {$order->spb_number} berstatus Sudah Dikirim menuju PKS.");
    }
}
