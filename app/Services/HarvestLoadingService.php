<?php

namespace App\Services;

use App\Enums\DeliveryStatus;
use App\Enums\TransportStatus;
use App\Models\Block;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderItem;
use App\Models\TphHarvestRecord;
use App\Models\TphPoint;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HarvestLoadingService
{
    public function __construct(
        private readonly GpsDistanceService $gpsDistanceService,
        private readonly LotCodeGeneratorService $codeGenerator,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function createHarvestRecord(array $data, User $recorder): TphHarvestRecord
    {
        /** @var TphPoint $tphPoint */
        $tphPoint = TphPoint::query()->findOrFail((int) $data['tph_point_id']);

        $blockId = isset($data['block_id']) ? (int) $data['block_id'] : $tphPoint->block_id;
        /** @var Block $block */
        $block = Block::query()->findOrFail($blockId);

        $grossWeight = round((float) $data['gross_weight_kg'], 2);
        if ($grossWeight <= 0) {
            throw ValidationException::withMessages([
                'gross_weight_kg' => 'Berat timbang harus lebih besar dari 0 Kg.',
            ]);
        }

        /** @var list<int> $workerIds */
        $workerIds = array_values(array_unique(array_map(
            static fn (mixed $id): int => (int) $id,
            $data['worker_ids'] ?? (isset($data['worker_id']) ? [$data['worker_id']] : []),
        )));

        if ($workerIds === []) {
            throw ValidationException::withMessages([
                'worker_ids' => 'Pilih minimal 1 tenaga kerja.',
            ]);
        }

        $inputLat = isset($data['input_latitude']) && $data['input_latitude'] !== '' ? (float) $data['input_latitude'] : null;
        $inputLon = isset($data['input_longitude']) && $data['input_longitude'] !== '' ? (float) $data['input_longitude'] : null;

        $distanceMeters = ($inputLat !== null && $inputLon !== null)
            ? $this->gpsDistanceService->calculateDistanceMeters(
                $tphPoint->latitude,
                $tphPoint->longitude,
                $inputLat,
                $inputLon,
            )
            : null;

        $workDate = Carbon::parse((string) $data['work_date']);

        /** @var list<string> $photoPaths */
        $photoPaths = array_values(array_filter(
            $data['photo_paths'] ?? (isset($data['photo_path']) && $data['photo_path'] !== '' ? [$data['photo_path']] : []),
            static fn (mixed $path): bool => is_string($path) && $path !== '',
        ));

        $weigherUserId = isset($data['weigher_user_id']) && $data['weigher_user_id'] !== ''
            ? (int) $data['weigher_user_id']
            : $recorder->id;

        return DB::transaction(function () use (
            $data,
            $tphPoint,
            $block,
            $workerIds,
            $recorder,
            $weigherUserId,
            $grossWeight,
            $photoPaths,
            $inputLat,
            $inputLon,
            $distanceMeters,
            $workDate,
        ): TphHarvestRecord {
            $record = TphHarvestRecord::create([
                'lot_number' => $data['lot_number'] ?? $this->codeGenerator->nextHarvestLotNumber($workDate),
                'work_date' => $workDate->toDateString(),
                'division_id' => $block->division_id,
                'block_id' => $block->id,
                'tph_point_id' => $tphPoint->id,
                'worker_id' => $workerIds[0],
                'recorder_user_id' => $recorder->id,
                'weigher_user_id' => $weigherUserId,
                'harvest_type' => $data['harvest_type'],
                'sack_count' => (int) $data['sack_count'],
                'tph_count' => (int) ($data['tph_count'] ?? 1),
                'bunch_count' => null,
                'gross_weight_kg' => $grossWeight,
                'sack_deduction_kg' => 0.0,
                'net_weight_kg' => $grossWeight,
                'photo_path' => $photoPaths[0] ?? null,
                'photo_paths' => $photoPaths !== [] ? $photoPaths : null,
                'input_latitude' => $inputLat,
                'input_longitude' => $inputLon,
                'gps_distance_meters' => $distanceMeters,
                'weighed_at' => isset($data['weighed_at']) ? Carbon::parse((string) $data['weighed_at']) : now(),
                'transport_status' => TransportStatus::BelumDiangkut,
                'loaded_sack_count' => 0,
            ]);

            $record->workers()->sync($workerIds);

            return $record->fresh(['division', 'block', 'tphPoint', 'worker', 'workers', 'recorder', 'weigher']) ?? $record;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  list<array{tph_harvest_record_id: int, loaded_sacks: int}>  $items
     */
    public function createDeliveryOrder(array $data, array $items, User $loader): DeliveryOrder
    {
        return DB::transaction(function () use ($data, $items, $loader): DeliveryOrder {
            $status = isset($data['delivery_status'])
                ? DeliveryStatus::from((string) $data['delivery_status'])
                : DeliveryStatus::BelumMuat;

            /** @var list<string>|null $loadingPhotos */
            $loadingPhotos = isset($data['loading_photo_paths']) && is_array($data['loading_photo_paths'])
                ? array_values(array_filter($data['loading_photo_paths'], static fn (mixed $p): bool => is_string($p) && $p !== ''))
                : null;

            $order = DeliveryOrder::create([
                'spb_number' => $data['spb_number'] ?? $this->codeGenerator->nextSpbNumber(),
                'division_id' => (int) $data['division_id'],
                'truck_id' => (int) $data['truck_id'],
                'pks_mill_id' => (int) $data['pks_mill_id'],
                'notes' => isset($data['notes']) && trim((string) $data['notes']) !== '' ? trim((string) $data['notes']) : null,
                'loader_user_id' => $loader->id,
                'total_sacks_loaded' => 0,
                'total_estimated_kg' => 0,
                'loading_photo_paths' => $loadingPhotos !== [] ? $loadingPhotos : null,
                'departed_at' => $status === DeliveryStatus::SudahDikirim
                    ? (isset($data['departed_at']) ? Carbon::parse((string) $data['departed_at']) : now())
                    : null,
                'delivery_status' => $status,
            ]);

            $this->attachItemsLocked($order, $items);

            return $order->fresh(['items.harvestRecord', 'division', 'truck', 'pksMill', 'loader']) ?? $order;
        });
    }

    /**
     * @param  list<array{tph_harvest_record_id: int, loaded_sacks: int}>  $items
     */
    public function appendItemsToDeliveryOrder(DeliveryOrder $order, array $items): DeliveryOrder
    {
        if ($order->pks_net_weight_kg !== null) {
            throw ValidationException::withMessages([
                'items' => 'Surat Jalan sudah tercatat timbangan PKS dan tidak dapat ditambah muatan lagi.',
            ]);
        }

        return DB::transaction(function () use ($order, $items): DeliveryOrder {
            $this->attachItemsLocked($order, $items);

            return $order->fresh(['items.harvestRecord', 'division', 'truck', 'pksMill', 'loader']) ?? $order;
        });
    }

    /**
     * @param  list<string>|null  $loadingPhotoPaths
     */
    public function dispatchDeliveryOrder(
        DeliveryOrder $order,
        ?Carbon $departedAt = null,
        ?array $loadingPhotoPaths = null,
    ): DeliveryOrder {
        if ($order->total_sacks_loaded <= 0) {
            throw ValidationException::withMessages([
                'delivery_status' => 'Muatan truk masih kosong. Tambahkan minimal 1 karung sebelum mengirim SPB.',
            ]);
        }

        $payload = [
            'delivery_status' => DeliveryStatus::SudahDikirim,
            'departed_at' => $departedAt ?? now(),
        ];

        if ($loadingPhotoPaths !== null && $loadingPhotoPaths !== []) {
            $payload['loading_photo_paths'] = $loadingPhotoPaths;
        }

        $order->update($payload);

        return $order->fresh() ?? $order;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function recordPksWeighing(DeliveryOrder $order, array $data): DeliveryOrder
    {
        return DB::transaction(function () use ($order, $data): DeliveryOrder {
            /** @var DeliveryOrder $lockedOrder */
            $lockedOrder = DeliveryOrder::query()->with('items')->lockForUpdate()->findOrFail($order->id);

            $pksNetWeight = round((float) $data['pks_net_weight_kg'], 2);
            $shrinkageKg = round($lockedOrder->total_estimated_kg - $pksNetWeight, 2);

            $lockedOrder->update([
                'pks_ticket_number' => (string) $data['pks_ticket_number'],
                'pks_net_weight_kg' => $pksNetWeight,
                'weight_shrinkage_kg' => $shrinkageKg,
                'pks_slip_photo_path' => $data['pks_slip_photo_path'] ?? $lockedOrder->pks_slip_photo_path,
                'arrived_at' => isset($data['arrived_at']) ? Carbon::parse((string) $data['arrived_at']) : now(),
                'departed_at' => $lockedOrder->departed_at ?? now(),
                'delivery_status' => DeliveryStatus::SudahDikirim,
            ]);

            $recordIds = $lockedOrder->items->pluck('tph_harvest_record_id')->unique()->all();
            foreach ($recordIds as $recordId) {
                /** @var TphHarvestRecord $record */
                $record = TphHarvestRecord::query()->lockForUpdate()->findOrFail($recordId);
                $this->syncRecordTransportStatus($record);
            }

            return $lockedOrder->fresh(['items.harvestRecord', 'division', 'truck', 'pksMill']) ?? $lockedOrder;
        });
    }

    /**
     * @param  list<array{tph_harvest_record_id: int, loaded_sacks: int}>  $items
     */
    private function attachItemsLocked(DeliveryOrder $order, array $items): void
    {
        if ($items === []) {
            throw ValidationException::withMessages([
                'items' => 'Pilih minimal satu lot catatan timbang TPH untuk dimuat ke Surat Jalan.',
            ]);
        }

        foreach ($items as $item) {
            $loadedSacks = (int) $item['loaded_sacks'];
            if ($loadedSacks <= 0) {
                throw ValidationException::withMessages([
                    'items' => 'Jumlah karung yang dinaikkan harus minimal 1 karung.',
                ]);
            }

            /** @var TphHarvestRecord $record */
            $record = TphHarvestRecord::query()->lockForUpdate()->findOrFail((int) $item['tph_harvest_record_id']);

            $remainingSacks = $record->remainingSacks();
            if ($loadedSacks > $remainingSacks) {
                throw ValidationException::withMessages([
                    'items' => "Klaim ganda ditolak: Lot {$record->lot_number} hanya menyisakan {$remainingSacks} karung di TPH.",
                ]);
            }

            $alreadyAllocatedKg = (float) $record->deliveryOrderItems()->sum('estimated_weight_kg');
            $estimatedKg = $loadedSacks === $remainingSacks
                ? round($record->net_weight_kg - $alreadyAllocatedKg, 2)
                : round(($record->net_weight_kg / $record->sack_count) * $loadedSacks, 2);

            DeliveryOrderItem::create([
                'delivery_order_id' => $order->id,
                'tph_harvest_record_id' => $record->id,
                'loaded_sacks' => $loadedSacks,
                'estimated_weight_kg' => max(0, $estimatedKg),
                'loaded_at' => now(),
            ]);

            $record->loaded_sack_count += $loadedSacks;
            $record->save();

            $this->syncRecordTransportStatus($record);
        }

        $order->update([
            'total_sacks_loaded' => (int) $order->items()->sum('loaded_sacks'),
            'total_estimated_kg' => round((float) $order->items()->sum('estimated_weight_kg'), 2),
        ]);
    }

    private function syncRecordTransportStatus(TphHarvestRecord $record): void
    {
        if ($record->loaded_sack_count <= 0) {
            $record->transport_status = TransportStatus::BelumDiangkut;
        } elseif ($record->loaded_sack_count < $record->sack_count) {
            $record->transport_status = TransportStatus::DiangkutSebagian;
        } else {
            $hasUnweighedOrder = $record->deliveryOrderItems()
                ->whereHas('deliveryOrder', fn ($query) => $query->whereNull('pks_net_weight_kg'))
                ->exists();

            $record->transport_status = $hasUnweighedOrder
                ? TransportStatus::SudahDiangkut
                : TransportStatus::SudahMasukPks;
        }

        $record->save();
    }
}
