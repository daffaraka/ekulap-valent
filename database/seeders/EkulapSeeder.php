<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\HarvestType;
use App\Enums\RecordStatus;
use App\Enums\TransportStatus;
use App\Enums\WorkerJobType;
use App\Models\Block;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderItem;
use App\Models\Division;
use App\Models\PksMill;
use App\Models\TphHarvestRecord;
use App\Models\TphPoint;
use App\Models\Truck;
use App\Models\User;
use App\Models\Worker;
use App\Services\GpsDistanceService;
use Illuminate\Database\Seeder;

class EkulapSeeder extends Seeder
{
    public function run(): void
    {
        $divIv = Division::query()->updateOrCreate(
            ['code' => 'DIV-IV'],
            ['name' => 'Divisi IV Jalemo Estate']
        );

        $divIi = Division::query()->updateOrCreate(
            ['code' => 'DIV-II'],
            ['name' => 'Divisi II Bukit Sari Estate']
        );

        $this->call(UserSeeder::class);

        $admin = User::query()->where('username', '10010001')->firstOrFail();
        $kerani = User::query()->where('username', '10010003')->firstOrFail();
        $asisten = User::query()->where('username', '10010004')->firstOrFail();

        $blockA12 = Block::query()->updateOrCreate(
            ['division_id' => $divIv->id, 'code' => 'A12'],
            ['planting_year' => 2018]
        );

        $blockB05 = Block::query()->updateOrCreate(
            ['division_id' => $divIv->id, 'code' => 'B05'],
            ['planting_year' => 2019]
        );

        $blockA14 = Block::query()->updateOrCreate(
            ['division_id' => $divIv->id, 'code' => 'A14'],
            ['planting_year' => 2017]
        );

        $blockC03 = Block::query()->updateOrCreate(
            ['division_id' => $divIi->id, 'code' => 'C03'],
            ['planting_year' => 2020]
        );

        $tphA1201 = TphPoint::query()->updateOrCreate(
            ['code' => 'TPH-A12-01'],
            [
                'block_id' => $blockA12->id,
                'location_label' => 'Simpang Jalan Utama Blok A12',
                'latitude' => 3.1245100,
                'longitude' => 99.3421800,
            ]
        );

        $tphA1202 = TphPoint::query()->updateOrCreate(
            ['code' => 'TPH-A12-02'],
            [
                'block_id' => $blockA12->id,
                'location_label' => 'TPH Timur Pasar Pikul Blok A12',
                'latitude' => 3.1258900,
                'longitude' => 99.3440200,
            ]
        );

        $tphB0501 = TphPoint::query()->updateOrCreate(
            ['code' => 'TPH-B05-01'],
            [
                'block_id' => $blockB05->id,
                'location_label' => 'Perbatasan Parit Blok B05',
                'latitude' => 3.1211000,
                'longitude' => 99.3389500,
            ]
        );

        $tphA1401 = TphPoint::query()->updateOrCreate(
            ['code' => 'TPH-A14-01'],
            [
                'block_id' => $blockA14->id,
                'location_label' => 'Simpang Jembatan Besi Blok A14',
                'latitude' => 3.1284000,
                'longitude' => 99.3455000,
            ]
        );

        $tphC0301 = TphPoint::query()->updateOrCreate(
            ['code' => 'TPH-C03-01'],
            [
                'block_id' => $blockC03->id,
                'location_label' => 'Main Road Pos 2 Blok C03',
                'latitude' => 3.1332100,
                'longitude' => 99.3510400,
            ]
        );

        $suherman = Worker::query()->updateOrCreate(
            ['worker_code' => 'PMN-014'],
            [
                'division_id' => $divIv->id,
                'name' => 'Suherman',
                'job_type' => WorkerJobType::KutipLapisBrondolan,
                'status' => RecordStatus::Aktif,
            ]
        );

        $joko = Worker::query()->updateOrCreate(
            ['worker_code' => 'PMN-015'],
            [
                'division_id' => $divIv->id,
                'name' => 'Joko Susanto',
                'job_type' => WorkerJobType::PemanenTbs,
                'status' => RecordStatus::Aktif,
            ]
        );

        $slamet = Worker::query()->updateOrCreate(
            ['worker_code' => 'PMN-016'],
            [
                'division_id' => $divIv->id,
                'name' => 'Slamet Riyadi',
                'job_type' => WorkerJobType::KutipLapisBrondolan,
                'status' => RecordStatus::Aktif,
            ]
        );

        $agus = Worker::query()->updateOrCreate(
            ['worker_code' => 'PMN-021'],
            [
                'division_id' => $divIi->id,
                'name' => 'Agus Salim',
                'job_type' => WorkerJobType::PemanenTbs,
                'status' => RecordStatus::Aktif,
            ]
        );

        $rahmat = Worker::query()->updateOrCreate(
            ['worker_code' => 'PMN-022'],
            [
                'division_id' => $divIi->id,
                'name' => 'Rahmat Hidayat',
                'job_type' => WorkerJobType::KutipLapisBrondolan,
                'status' => RecordStatus::Aktif,
            ]
        );

        $truck1 = Truck::query()->updateOrCreate(
            ['plate_number' => 'BK 8821 XX'],
            [
                'driver_name' => 'Budi Hartono',
                'driver_phone' => '081260001005',
                'capacity_kg' => 8000,
            ]
        );

        $truck2 = Truck::query()->updateOrCreate(
            ['plate_number' => 'BK 9142 XY'],
            [
                'driver_name' => 'Supriadi',
                'driver_phone' => '081260002011',
                'capacity_kg' => 10000,
            ]
        );

        Truck::query()->updateOrCreate(
            ['plate_number' => 'BK 7730 XZ'],
            [
                'driver_name' => 'Taufik Hidayat',
                'driver_phone' => '081260002012',
                'capacity_kg' => 8000,
            ]
        );

        $pksSm = PksMill::query()->updateOrCreate(
            ['code' => 'PKS-SM'],
            ['name' => 'PKS Sei Mangkei']
        );

        $pksTg = PksMill::query()->updateOrCreate(
            ['code' => 'PKS-TG'],
            ['name' => 'PKS Tanah Gambus']
        );

        if (TphHarvestRecord::query()->exists()) {
            return;
        }

        $gpsService = app(GpsDistanceService::class);

        $lot1 = TphHarvestRecord::create([
            'lot_number' => 'HRV-20261115-001',
            'work_date' => '2026-11-15',
            'division_id' => $divIv->id,
            'block_id' => $blockA12->id,
            'tph_point_id' => $tphA1201->id,
            'worker_id' => $suherman->id,
            'recorder_user_id' => $kerani->id,
            'weigher_user_id' => $kerani->id,
            'harvest_type' => HarvestType::KutipLapis,
            'sack_count' => 10,
            'tph_count' => 1,
            'bunch_count' => null,
            'gross_weight_kg' => 350.00,
            'sack_deduction_kg' => 0.00,
            'net_weight_kg' => 350.00,
            'input_latitude' => 3.1245200,
            'input_longitude' => 99.3421950,
            'gps_distance_meters' => $gpsService->calculateDistanceMeters(3.1245100, 99.3421800, 3.1245200, 99.3421950),
            'weighed_at' => '2026-11-15 09:20:00',
            'transport_status' => TransportStatus::SudahMasukPks,
            'loaded_sack_count' => 10,
        ]);
        $lot1->blocks()->sync([$blockA12->id]);
        $lot1->workers()->sync([$suherman->id]);

        $lot2 = TphHarvestRecord::create([
            'lot_number' => 'HRV-20261115-002',
            'work_date' => '2026-11-15',
            'division_id' => $divIv->id,
            'block_id' => $blockA12->id,
            'tph_point_id' => $tphA1202->id,
            'worker_id' => $joko->id,
            'recorder_user_id' => $kerani->id,
            'weigher_user_id' => $kerani->id,
            'harvest_type' => HarvestType::Tbs,
            'sack_count' => 15,
            'tph_count' => 2,
            'bunch_count' => null,
            'gross_weight_kg' => 520.00,
            'sack_deduction_kg' => 0.00,
            'net_weight_kg' => 520.00,
            'input_latitude' => 3.1259100,
            'input_longitude' => 99.3440400,
            'gps_distance_meters' => $gpsService->calculateDistanceMeters(3.1258900, 99.3440200, 3.1259100, 99.3440400),
            'weighed_at' => '2026-11-15 10:05:00',
            'transport_status' => TransportStatus::SudahMasukPks,
            'loaded_sack_count' => 15,
        ]);
        $lot2->blocks()->sync([$blockA12->id]);
        $lot2->workers()->sync([$joko->id, $slamet->id]);

        $lot3 = TphHarvestRecord::create([
            'lot_number' => 'HRV-20261115-003',
            'work_date' => '2026-11-15',
            'division_id' => $divIi->id,
            'block_id' => $blockC03->id,
            'tph_point_id' => $tphC0301->id,
            'worker_id' => $agus->id,
            'recorder_user_id' => $admin->id,
            'weigher_user_id' => $admin->id,
            'harvest_type' => HarvestType::Tbs,
            'sack_count' => 20,
            'tph_count' => 1,
            'bunch_count' => null,
            'gross_weight_kg' => 700.00,
            'sack_deduction_kg' => 0.00,
            'net_weight_kg' => 700.00,
            'input_latitude' => 3.1332400,
            'input_longitude' => 99.3510700,
            'gps_distance_meters' => $gpsService->calculateDistanceMeters(3.1332100, 99.3510400, 3.1332400, 99.3510700),
            'weighed_at' => '2026-11-15 11:30:00',
            'transport_status' => TransportStatus::SudahMasukPks,
            'loaded_sack_count' => 20,
        ]);
        $lot3->blocks()->sync([$blockC03->id]);
        $lot3->workers()->sync([$agus->id]);

        $lot4 = TphHarvestRecord::create([
            'lot_number' => 'HRV-20261116-001',
            'work_date' => '2026-11-16',
            'division_id' => $divIv->id,
            'block_id' => $blockA12->id,
            'tph_point_id' => $tphA1201->id,
            'worker_id' => $suherman->id,
            'recorder_user_id' => $kerani->id,
            'weigher_user_id' => $kerani->id,
            'harvest_type' => HarvestType::KutipLapis,
            'sack_count' => 10,
            'tph_count' => 1,
            'bunch_count' => null,
            'gross_weight_kg' => 350.00,
            'sack_deduction_kg' => 0.00,
            'net_weight_kg' => 350.00,
            'input_latitude' => 3.1245300,
            'input_longitude' => 99.3421900,
            'gps_distance_meters' => $gpsService->calculateDistanceMeters(3.1245100, 99.3421800, 3.1245300, 99.3421900),
            'weighed_at' => '2026-11-16 08:15:00',
            'transport_status' => TransportStatus::DiangkutSebagian,
            'loaded_sack_count' => 6,
        ]);
        $lot4->blocks()->sync([$blockA12->id]);
        $lot4->workers()->sync([$suherman->id]);

        $lot5 = TphHarvestRecord::create([
            'lot_number' => 'HRV-20261116-002',
            'work_date' => '2026-11-16',
            'division_id' => $divIv->id,
            'block_id' => $blockB05->id,
            'tph_point_id' => $tphB0501->id,
            'worker_id' => $slamet->id,
            'recorder_user_id' => $kerani->id,
            'weigher_user_id' => $kerani->id,
            'harvest_type' => HarvestType::Brondolan,
            'sack_count' => 14,
            'tph_count' => 2,
            'bunch_count' => null,
            'gross_weight_kg' => 490.00,
            'sack_deduction_kg' => 0.00,
            'net_weight_kg' => 490.00,
            'input_latitude' => 3.1211300,
            'input_longitude' => 99.3389900,
            'gps_distance_meters' => $gpsService->calculateDistanceMeters(3.1211000, 99.3389500, 3.1211300, 99.3389900),
            'weighed_at' => '2026-11-16 08:45:00',
            'transport_status' => TransportStatus::SudahDiangkut,
            'loaded_sack_count' => 14,
        ]);
        $lot5->blocks()->sync([$blockB05->id]);
        $lot5->workers()->sync([$slamet->id]);

        $lot6 = TphHarvestRecord::create([
            'lot_number' => 'HRV-20261116-003',
            'work_date' => '2026-11-16',
            'division_id' => $divIv->id,
            'block_id' => $blockA14->id,
            'tph_point_id' => $tphA1401->id,
            'worker_id' => $suherman->id,
            'recorder_user_id' => $kerani->id,
            'weigher_user_id' => $kerani->id,
            'harvest_type' => HarvestType::KutipLapis,
            'sack_count' => 10,
            'tph_count' => 1,
            'bunch_count' => null,
            'gross_weight_kg' => 350.00,
            'sack_deduction_kg' => 0.00,
            'net_weight_kg' => 350.00,
            'input_latitude' => 3.1297500,
            'input_longitude' => 99.3461000,
            'gps_distance_meters' => $gpsService->calculateDistanceMeters(3.1284000, 99.3455000, 3.1297500, 99.3461000),
            'weighed_at' => '2026-11-16 09:30:00',
            'transport_status' => TransportStatus::BelumDiangkut,
            'loaded_sack_count' => 0,
        ]);
        $lot6->blocks()->sync([$blockA14->id]);
        $lot6->workers()->sync([$suherman->id, $slamet->id]);

        $lot7 = TphHarvestRecord::create([
            'lot_number' => 'HRV-20261116-004',
            'work_date' => '2026-11-16',
            'division_id' => $divIi->id,
            'block_id' => $blockC03->id,
            'tph_point_id' => $tphC0301->id,
            'worker_id' => $rahmat->id,
            'recorder_user_id' => $admin->id,
            'weigher_user_id' => $admin->id,
            'harvest_type' => HarvestType::Brondolan,
            'sack_count' => 12,
            'tph_count' => 1,
            'bunch_count' => null,
            'gross_weight_kg' => 420.00,
            'sack_deduction_kg' => 0.00,
            'net_weight_kg' => 420.00,
            'input_latitude' => 3.1332800,
            'input_longitude' => 99.3511200,
            'gps_distance_meters' => $gpsService->calculateDistanceMeters(3.1332100, 99.3510400, 3.1332800, 99.3511200),
            'weighed_at' => '2026-11-16 10:10:00',
            'transport_status' => TransportStatus::BelumDiangkut,
            'loaded_sack_count' => 0,
        ]);
        $lot7->blocks()->sync([$blockC03->id]);
        $lot7->workers()->sync([$rahmat->id]);

        $spb1 = DeliveryOrder::create([
            'spb_number' => 'SPB-20261115-001',
            'division_id' => $divIv->id,
            'truck_id' => $truck1->id,
            'pks_mill_id' => $pksSm->id,
            'notes' => 'Pengangkutan menuju PKS Sei Mangkei (Trip Pagi)',
            'loader_user_id' => $asisten->id,
            'total_sacks_loaded' => 25,
            'total_estimated_kg' => 870.00,
            'departed_at' => '2026-11-15 13:15:00',
            'pks_ticket_number' => 'TKT-SM-88412',
            'pks_net_weight_kg' => 863.00,
            'weight_shrinkage_kg' => 7.00,
            'arrived_at' => '2026-11-15 15:05:00',
            'delivery_status' => DeliveryStatus::SudahDikirim,
        ]);

        DeliveryOrderItem::create([
            'delivery_order_id' => $spb1->id,
            'tph_harvest_record_id' => $lot1->id,
            'loaded_sacks' => 10,
            'estimated_weight_kg' => 350.00,
            'loaded_at' => '2026-11-15 12:45:00',
        ]);

        DeliveryOrderItem::create([
            'delivery_order_id' => $spb1->id,
            'tph_harvest_record_id' => $lot2->id,
            'loaded_sacks' => 15,
            'estimated_weight_kg' => 520.00,
            'loaded_at' => '2026-11-15 13:00:00',
        ]);

        $spb2 = DeliveryOrder::create([
            'spb_number' => 'SPB-20261115-002',
            'division_id' => $divIi->id,
            'truck_id' => $truck2->id,
            'pks_mill_id' => $pksTg->id,
            'notes' => 'Pengangkutan Divisi II ke PKS Tanah Gambus',
            'loader_user_id' => $admin->id,
            'total_sacks_loaded' => 20,
            'total_estimated_kg' => 700.00,
            'departed_at' => '2026-11-15 14:00:00',
            'pks_ticket_number' => 'TKT-TG-44219',
            'pks_net_weight_kg' => 678.00,
            'weight_shrinkage_kg' => 22.00,
            'arrived_at' => '2026-11-15 16:20:00',
            'delivery_status' => DeliveryStatus::SudahDikirim,
        ]);

        DeliveryOrderItem::create([
            'delivery_order_id' => $spb2->id,
            'tph_harvest_record_id' => $lot3->id,
            'loaded_sacks' => 20,
            'estimated_weight_kg' => 700.00,
            'loaded_at' => '2026-11-15 13:45:00',
        ]);

        $spb3 = DeliveryOrder::create([
            'spb_number' => 'SPB-20261116-001',
            'division_id' => $divIv->id,
            'truck_id' => $truck1->id,
            'pks_mill_id' => $pksSm->id,
            'notes' => 'Pengangkutan lanjutan Divisi IV ke PKS Sei Mangkei',
            'loader_user_id' => $asisten->id,
            'total_sacks_loaded' => 20,
            'total_estimated_kg' => 700.00,
            'departed_at' => '2026-11-16 09:40:00',
            'delivery_status' => DeliveryStatus::SudahDikirim,
        ]);

        DeliveryOrderItem::create([
            'delivery_order_id' => $spb3->id,
            'tph_harvest_record_id' => $lot4->id,
            'loaded_sacks' => 6,
            'estimated_weight_kg' => 210.00,
            'loaded_at' => '2026-11-16 09:20:00',
        ]);

        DeliveryOrderItem::create([
            'delivery_order_id' => $spb3->id,
            'tph_harvest_record_id' => $lot5->id,
            'loaded_sacks' => 14,
            'estimated_weight_kg' => 490.00,
            'loaded_at' => '2026-11-16 09:32:00',
        ]);
    }
}
