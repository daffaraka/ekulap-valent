<?php

namespace Tests\Feature;

use App\Ai\Agents\EkulapAnalystAgent;
use App\Enums\DeliveryStatus;
use App\Enums\RecordStatus;
use App\Enums\TransportStatus;
use App\Enums\UserRole;
use App\Models\Block;
use App\Models\DeliveryOrder;
use App\Models\Division;
use App\Models\PksMill;
use App\Models\TphHarvestRecord;
use App\Models\TphPoint;
use App\Models\Truck;
use App\Models\User;
use App\Models\Worker;
use Database\Seeders\EkulapSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EkulapWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(EkulapSeeder::class);
    }

    public function test_users_can_login_with_nik_only_while_email_name_and_inactive_are_blocked(): void
    {
        $response = $this->post(route('login.store'), [
            'email' => '10010001',
            'password' => 'password',
        ]);
        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $this->post(route('logout'));
        $this->assertGuest();

        // Login menggunakan email atau nama ditolak (harus NIK)
        $this->post(route('login.store'), [
            'email' => 'erik.harahap@ekulap.sinarmas.co.id',
            'password' => 'password',
        ]);
        $this->assertGuest();

        $this->post(route('login.store'), [
            'email' => 'Erik Harahap',
            'password' => 'password',
        ]);
        $this->assertGuest();

        // Kerani Produksi diarahkan ke Timbang TPH setelah login
        $keraniLogin = $this->post(route('login.store'), [
            'email' => '10010003',
            'password' => 'password',
        ]);
        $this->assertAuthenticated();
        $keraniLogin->assertRedirect(route('tph-harvest.index'));

        $this->post(route('logout'));

        // Akun Nonaktif diblokir
        $inactiveLogin = $this->post(route('login.store'), [
            'email' => '10010007',
            'password' => 'password',
        ]);
        $this->assertGuest();
        $inactiveLogin->assertSessionHasErrors('email');
    }

    public function test_full_10_sack_350kg_simulation_multi_worker_photos_spb_and_status_kutip_lapis(): void
    {
        Storage::fake('public');

        $kerani = User::query()->where('username', '10010003')->firstOrFail();
        $asisten = User::query()->where('username', '10010004')->firstOrFail();
        $checker = User::query()->where('username', '10010006')->firstOrFail();

        $division = Division::query()->where('code', 'DIV-IV')->firstOrFail();
        $block = Block::query()->where('code', 'A12')->firstOrFail();
        $tph = TphPoint::query()->where('code', 'TPH-A12-01')->firstOrFail();
        $worker1 = Worker::query()->where('worker_code', 'PMN-014')->firstOrFail();
        $worker2 = Worker::query()->where('worker_code', 'PMN-016')->firstOrFail();
        $truck = Truck::query()->where('plate_number', 'BK 8821 XX')->firstOrFail();
        $pks = PksMill::query()->where('code', 'PKS-SM')->firstOrFail();

        // Validasi gambar minimal 3 ditolak jika hanya 2 foto
        $this->actingAs($kerani)->post(route('tph-harvest.store'), [
            'work_date' => now()->toDateString(),
            'block_id' => $block->id,
            'tph_point_id' => $tph->id,
            'worker_ids' => [$worker1->id, $worker2->id],
            'weigher_user_id' => $kerani->id,
            'harvest_type' => 'Kutip Lapis',
            'sack_count' => 10,
            'tph_count' => 2,
            'gross_weight_kg' => 350,
            'photos' => [
                UploadedFile::fake()->image('foto1.jpg'),
                UploadedFile::fake()->image('foto2.jpg'),
            ],
        ])->assertSessionHasErrors('photos');

        // Tahap 1: Kerani timbang 10 karung / 350 Kg (tanpa potongan karung), 2 pekerja, petugas timbang, 3 foto
        $this->actingAs($kerani)->post(route('tph-harvest.store'), [
            'work_date' => now()->toDateString(),
            'block_id' => $block->id,
            'tph_point_id' => $tph->id,
            'worker_ids' => [$worker1->id, $worker2->id],
            'weigher_user_id' => $kerani->id,
            'harvest_type' => 'Kutip Lapis',
            'sack_count' => 10,
            'tph_count' => 2,
            'gross_weight_kg' => 350,
            'input_latitude' => $tph->latitude,
            'input_longitude' => $tph->longitude,
            'photos' => [
                UploadedFile::fake()->image('bukti1.jpg'),
                UploadedFile::fake()->image('bukti2.jpg'),
                UploadedFile::fake()->image('bukti3.jpg'),
            ],
        ])->assertRedirect(route('tph-harvest.index'));

        /** @var TphHarvestRecord $lot */
        $lot = TphHarvestRecord::query()->with('workers')->latest('id')->firstOrFail();
        $this->assertSame(10, $lot->sack_count);
        $this->assertSame(2, $lot->tph_count);
        $this->assertEquals(350.0, $lot->net_weight_kg);
        $this->assertEquals(0.0, $lot->sack_deduction_kg);
        $this->assertSame($kerani->id, $lot->weigher_user_id);
        $this->assertCount(2, $lot->workers);
        $this->assertCount(3, $lot->photo_paths ?? []);
        $this->assertSame(0, $lot->loaded_sack_count);
        $this->assertSame(TransportStatus::BelumDiangkut, $lot->transport_status);
        $this->assertEquals(0.0, $lot->gps_distance_meters);

        // Tahap 2: Muat sebagian (6 dari 10 karung) dengan status Sudah Dikirim + keterangan + 2 foto SPB
        $this->actingAs($asisten)->post(route('surat-jalan.store'), [
            'division_id' => $division->id,
            'truck_id' => $truck->id,
            'pks_mill_id' => $pks->id,
            'notes' => 'Pengangkutan menuju SPB PKS Sei Mangkei',
            'delivery_status' => DeliveryStatus::SudahDikirim->value,
            'loading_photos' => [
                UploadedFile::fake()->image('muat1.jpg'),
                UploadedFile::fake()->image('muat2.jpg'),
            ],
            'items' => [
                ['tph_harvest_record_id' => $lot->id, 'loaded_sacks' => 6],
            ],
        ])->assertRedirect();

        $lot->refresh();
        $this->assertSame(6, $lot->loaded_sack_count);
        $this->assertSame(TransportStatus::DiangkutSebagian, $lot->transport_status);

        /** @var DeliveryOrder $spb1 */
        $spb1 = DeliveryOrder::query()->latest('id')->firstOrFail();
        $this->assertSame(6, $spb1->total_sacks_loaded);
        $this->assertEquals(210.0, $spb1->total_estimated_kg);
        $this->assertSame('Pengangkutan menuju SPB PKS Sei Mangkei', $spb1->notes);
        $this->assertCount(2, $spb1->loading_photo_paths ?? []);
        $this->assertSame(DeliveryStatus::SudahDikirim, $spb1->delivery_status);

        // Tahap 3a: Uji anti-klaim ganda (mencoba muat 5 karung padahal sisa 4)
        $this->actingAs($asisten)->post(route('surat-jalan.store'), [
            'division_id' => $division->id,
            'truck_id' => $truck->id,
            'pks_mill_id' => $pks->id,
            'delivery_status' => DeliveryStatus::BelumMuat->value,
            'items' => [
                ['tph_harvest_record_id' => $lot->id, 'loaded_sacks' => 5],
            ],
        ])->assertSessionHasErrors('items');

        // Tahap 3b: Buat SPB kedua dengan status Belum Muat, lalu kirim dengan 1 foto pengangkutan
        $this->actingAs($kerani)->post(route('surat-jalan.store'), [
            'division_id' => $division->id,
            'truck_id' => $truck->id,
            'pks_mill_id' => $pks->id,
            'notes' => 'Sisa muatan ke SPB sesi sore',
            'delivery_status' => DeliveryStatus::BelumMuat->value,
            'items' => [
                ['tph_harvest_record_id' => $lot->id, 'loaded_sacks' => 4],
            ],
        ])->assertRedirect();

        $lot->refresh();
        $this->assertSame(10, $lot->loaded_sack_count);
        $this->assertSame(TransportStatus::SudahDiangkut, $lot->transport_status);

        /** @var DeliveryOrder $spb2 */
        $spb2 = DeliveryOrder::query()->latest('id')->firstOrFail();
        $this->assertSame(DeliveryStatus::BelumMuat, $spb2->delivery_status);
        $this->assertEquals(140.0, $spb2->total_estimated_kg);

        $this->actingAs($kerani)->post(route('surat-jalan.dispatch', $spb2), [
            'loading_photos' => [
                UploadedFile::fake()->image('kirim1.jpg'),
            ],
        ])->assertRedirect();

        $spb2->refresh();
        $this->assertSame(DeliveryStatus::SudahDikirim, $spb2->delivery_status);
        $this->assertCount(1, $spb2->loading_photo_paths ?? []);

        // Tahap 4: Checker PKS mencatat tiket jembatan timbang PKS
        $this->actingAs($checker)->post(route('pks-reconciliation.weigh', $spb1), [
            'pks_ticket_number' => 'TKT-SM-9001',
            'pks_net_weight_kg' => 206.5,
        ])->assertRedirect(route('pks-reconciliation.index'));

        $spb1->refresh();
        $this->assertEquals(3.5, $spb1->weight_shrinkage_kg);

        $lot->refresh();
        $this->assertSame(TransportStatus::SudahDiangkut, $lot->transport_status);

        $this->actingAs($checker)->post(route('pks-reconciliation.weigh', $spb2), [
            'pks_ticket_number' => 'TKT-SM-9002',
            'pks_net_weight_kg' => 138.0,
        ])->assertRedirect(route('pks-reconciliation.index'));

        $lot->refresh();
        $this->assertSame(TransportStatus::SudahMasukPks, $lot->transport_status);
    }

    public function test_role_permissions_for_kerani_and_asisten_and_ui_props(): void
    {
        $kerani = User::query()->where('username', '10010003')->firstOrFail();
        $asisten = User::query()->where('username', '10010004')->firstOrFail();
        $admin = User::query()->where('username', '10010001')->firstOrFail();

        // Poin #10: Kerani hanya Timbang TPH, SPB, Status Kutip Lapis
        $this->actingAs($kerani)->get(route('home'))->assertRedirect(route('tph-harvest.index'));
        $this->actingAs($kerani)->get(route('tph-harvest.index'))->assertOk();
        $this->actingAs($kerani)->get(route('surat-jalan.index'))->assertOk();
        $this->actingAs($kerani)->get(route('pks-reconciliation.index'))->assertOk();

        $this->actingAs($kerani)->get(route('dashboard'))->assertForbidden();
        $this->actingAs($kerani)->get(route('ai-assistant.index'))->assertForbidden();
        $this->actingAs($kerani)->get(route('master-data.index'))->assertForbidden();
        $this->actingAs($kerani)->get(route('users.index'))->assertForbidden();

        // Poin #11: Supervisi/Asisten tidak bisa atur maupun buka halaman pengguna
        $this->actingAs($asisten)->get(route('dashboard'))->assertOk();
        $this->actingAs($asisten)->get(route('master-data.index'))->assertOk();
        $this->actingAs($asisten)->get(route('users.index'))->assertForbidden();
        $this->actingAs($asisten)->post(route('users.store'), [
            'name' => 'Unauthorized',
            'username' => '10099999',
            'password' => 'secret123',
            'role' => UserRole::KeraniProduksi->value,
            'status' => RecordStatus::Aktif->value,
        ])->assertForbidden();

        // Verifikasi props Dashboard (#3) dan Timbang TPH (#4) serta Status Kutip Lapis (#9)
        $this->actingAs($admin)->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/DashboardOverview')
                ->has('kpis.cumulative_restan_days')
                ->where('statusBreakdown', fn ($items) => collect($items)->pluck('status')->doesntContain('Sudah Masuk PKS'))
            );

        $this->actingAs($admin)->get(route('tph-harvest.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('tph-harvest/TphHarvestIndex')
                ->where('transportStatuses', fn ($statuses) => collect($statuses)->doesntContain('Sudah Masuk PKS'))
            );

        $this->actingAs($admin)->get(route('pks-reconciliation.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('pks-reconciliation/PksReconciliationIndex')
                ->has('summary.waiting_sacks_to_pks')
                ->has('summary.unsent_days')
                ->has('summary.today_sent_percentage')
            );

        // Admin dapat ekspor CSV
        $export = $this->actingAs($admin)->get(route('pks-reconciliation.export'));
        $export->assertOk();
        $this->assertStringContainsString('SPB-20261115-001', $export->streamedContent());

        // Laravel AI SDK Agent fake test
        EkulapAnalystAgent::fake([
            'Terdapat 26 karung sisa di TPH (TPH-A12-01 dan TPH-A14-01) dan 1 SPB dengan susut > 2%.',
        ]);

        $aiRes = $this->actingAs($admin)->postJson(route('ai-assistant.ask'), [
            'question' => 'Bagaimana status karung Belum Diangkut saat ini?',
        ]);

        $aiRes->assertOk()
            ->assertJsonPath('mode', 'laravel_ai_sdk');

        EkulapAnalystAgent::assertPrompted('Bagaimana status karung Belum Diangkut saat ini?');
    }

    public function test_local_ai_tool_fallback_master_data_and_user_management_work(): void
    {
        $admin = User::query()->where('username', '10010001')->firstOrFail();

        $localAi = $this->actingAs($admin)->postJson(route('ai-assistant.ask'), [
            'question' => 'Cek karung belum diangkut, susut PKS, deviasi GPS, dan pemanen terbaik',
        ]);

        $localAi->assertOk()
            ->assertJsonPath('mode', 'local_tool_engine');
        $this->assertStringContainsString('HRV-20261116-003', (string) $localAi->json('answer'));
        $this->assertStringContainsString('SPB-20261115-002', (string) $localAi->json('answer'));

        // Uji Master Data (Tabel 2 - 7)
        $this->actingAs($admin)->post(route('master-data.divisions.store'), [
            'code' => 'DIV-V',
            'name' => 'Divisi V Sungai Rumbia',
        ])->assertRedirect();

        $divisionV = Division::query()->where('code', 'DIV-V')->firstOrFail();

        $this->actingAs($admin)->post(route('master-data.blocks.store'), [
            'division_id' => $divisionV->id,
            'code' => 'D01',
            'planting_year' => 2021,
        ])->assertRedirect();

        $blockD01 = $divisionV->blocks()->where('code', 'D01')->firstOrFail();

        $this->actingAs($admin)->post(route('master-data.tph-points.store'), [
            'block_id' => $blockD01->id,
            'code' => 'TPH-D01-01',
            'location_label' => 'Simpang Blok D01',
            'latitude' => 3.14001,
            'longitude' => 99.36001,
        ])->assertRedirect();

        $this->actingAs($admin)->post(route('master-data.workers.store'), [
            'division_id' => $divisionV->id,
            'worker_code' => 'PMN-099',
            'name' => 'Ahmad Yani',
            'job_type' => 'Pemanen TBS',
            'status' => 'Aktif',
        ])->assertRedirect();

        $this->actingAs($admin)->post(route('master-data.trucks.store'), [
            'plate_number' => 'BK 9999 AA',
            'driver_name' => 'Supriadi Baru',
            'driver_phone' => '081299998888',
            'capacity_kg' => 8500,
        ])->assertRedirect();

        $this->actingAs($admin)->post(route('master-data.pks-mills.store'), [
            'code' => 'PKS-LB',
            'name' => 'PKS Lubuk Dalam',
        ])->assertRedirect();

        // Uji Tabel 1 Manajemen Pengguna berbasis NIK
        $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'Siti Aminah',
            'username' => '10010099',
            'phone' => '081277776666',
            'password' => 'password123',
            'role' => UserRole::KeraniProduksi->value,
            'division_id' => $divisionV->id,
            'status' => RecordStatus::Aktif->value,
        ])->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', ['username' => '10010099', 'role' => 'Kerani Produksi']);
        $this->assertDatabaseHas('tph_points', ['code' => 'TPH-D01-01']);
    }

    public function test_ngrok_forwarded_https_proxy_headers_work_cleanly(): void
    {
        $headers = [
            'X-Forwarded-Proto' => 'https',
            'X-Forwarded-Host' => 'ekulap-demo.ngrok-free.app',
            'X-Forwarded-Port' => '443',
        ];

        $this->withHeaders($headers)
            ->get('/')
            ->assertRedirect('https://ekulap-demo.ngrok-free.app/login');

        $loginHtml = $this->withHeaders($headers)
            ->get('/login');
        $loginHtml->assertOk();
        $loginHtml->assertSee('https://ekulap-demo.ngrok-free.app/build/assets/', false);
        $loginHtml->assertDontSee(':5173', false);
        $loginHtml->assertDontSee('[::1]', false);

        $admin = User::query()->where('username', '10010001')->firstOrFail();

        $this->actingAs($admin)
            ->withHeaders($headers)
            ->get('/')
            ->assertOk();
    }
}
