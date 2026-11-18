<?php

namespace Tests\Feature;

use App\Enums\RecordStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Block;
use App\Models\TphHarvestRecord;
use App\Models\TphPoint;
use App\Models\User;
use App\Models\Worker;
use App\Services\SystemHealthLogService;
use Database\Seeders\EkulapSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SystemMonitorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(EkulapSeeder::class);
    }

    public function test_login_success_and_repeated_login_failures_are_recorded_in_human_language(): void
    {
        $this->post(route('login.store'), [
            'email' => '10010001',
            'password' => 'password',
        ])->assertRedirect(route('dashboard', absolute: false));

        $successLog = AuditLog::query()
            ->where('category', 'auth')
            ->where('action', 'login_success')
            ->latest('id')
            ->first();

        $this->assertNotNull($successLog);
        $this->assertSame('normal', $successLog->severity);
        $this->assertStringContainsString('berhasil masuk ke aplikasi', $successLog->human_message);

        $this->post(route('logout'));

        // Percobaan salah password 3x dalam 15 menit terakhir -> naik ke severity 'danger'
        for ($i = 1; $i <= 3; $i++) {
            $this->post(route('login.store'), [
                'email' => '10010003',
                'password' => 'salah-terus',
            ]);
        }

        $failedLogs = AuditLog::query()
            ->where('category', 'auth')
            ->where('action', 'login_failed')
            ->orderBy('id')
            ->get();

        $this->assertCount(3, $failedLogs);
        $this->assertSame('warning', $failedLogs[0]->severity);
        $this->assertSame('danger', $failedLogs[2]->severity);
        $this->assertStringContainsString('3x percobaan gagal', $failedLogs[2]->human_message);
    }

    public function test_operational_and_admin_mutations_record_audit_logs(): void
    {
        Storage::fake('public');

        $admin = User::query()->where('username', '10010001')->firstOrFail();
        $kerani = User::query()->where('username', '10010003')->firstOrFail();
        $block = Block::query()->firstOrFail();
        $tph = TphPoint::query()->firstOrFail();
        $worker = Worker::query()->firstOrFail();

        $this->actingAs($kerani)->post(route('tph-harvest.store'), [
            'work_date' => now()->toDateString(),
            'block_id' => $block->id,
            'tph_point_id' => $tph->id,
            'worker_ids' => [$worker->id],
            'weigher_user_id' => $kerani->id,
            'harvest_type' => 'Kutip Lapis',
            'sack_count' => 5,
            'tph_count' => 1,
            'gross_weight_kg' => 160,
            'input_latitude' => $tph->latitude,
            'input_longitude' => $tph->longitude,
            'photos' => [
                UploadedFile::fake()->image('a.jpg'),
                UploadedFile::fake()->image('b.jpg'),
                UploadedFile::fake()->image('c.jpg'),
            ],
        ])->assertRedirect();

        $record = TphHarvestRecord::query()->latest('id')->firstOrFail();

        $this->actingAs($admin)->delete(route('tph-harvest.destroy', $record))->assertRedirect();

        $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'Operator Uji',
            'username' => '10088801',
            'password' => 'password123',
            'role' => UserRole::KeraniProduksi->value,
            'status' => RecordStatus::Aktif->value,
        ])->assertRedirect();

        $this->actingAs($admin)->post(route('master-data.divisions.store'), [
            'code' => 'DIV-IX',
            'name' => 'Divisi IX Pengujian',
        ])->assertRedirect();

        $this->assertDatabaseHas('audit_logs', ['category' => 'harvest', 'action' => 'created', 'severity' => 'normal']);
        $this->assertDatabaseHas('audit_logs', ['category' => 'harvest', 'action' => 'deleted', 'severity' => 'warning']);
        $this->assertDatabaseHas('audit_logs', ['category' => 'users', 'action' => 'created', 'severity' => 'warning']);
        $this->assertDatabaseHas('audit_logs', ['category' => 'master', 'action' => 'created', 'severity' => 'normal']);
    }

    public function test_system_health_log_service_translates_technical_errors_to_human_language(): void
    {
        $now = now()->format('Y-m-d H:i:s');
        $sampleLog = implode("\n", [
            "[{$now}] production.ERROR: Illuminate\\Http\\Exceptions\\PostTooLargeException: The POST data is too large.",
            '#0 vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ValidatePostSize.php(29)',
            "[{$now}] production.ERROR: SQLSTATE[HY000]: General error: database is locked",
            "[{$now}] production.ERROR: Symfony\\Component\\HttpFoundation\\File\\Exception\\FileException: Permission denied on storage/app/public",
            "[{$now}] production.WARNING: Illuminate\\Session\\TokenMismatchException: CSRF token mismatch.",
        ]);

        $tmpFile = tempnam(sys_get_temp_dir(), 'ekulap_log_');
        $this->assertNotFalse($tmpFile);
        file_put_contents($tmpFile, $sampleLog);

        try {
            $service = app(SystemHealthLogService::class);
            $incidents = $service->parseRecentIncidents($tmpFile);
            $overview = $service->buildOverview($incidents, $tmpFile);

            $this->assertCount(4, $incidents);
            $this->assertSame('gangguan', $overview['status']);
            $this->assertSame(4, $overview['errors_24h']);
            $this->assertSame('Sesi Halaman Kedaluwarsa Sebelum Simpan', $incidents[0]['title']);
            $this->assertSame('Folder Penyimpanan Foto Tidak Bisa Diakses Server', $incidents[1]['title']);
            $this->assertSame('Kendala Penyimpanan atau Pembacaan Database', $incidents[2]['title']);
            $this->assertSame('Gagal Mengunggah Foto (Ukuran Melebihi Batas Server)', $incidents[3]['title']);
        } finally {
            @unlink($tmpFile);
        }
    }

    public function test_only_admin_and_pimpinan_can_access_system_monitor_and_export_csv(): void
    {
        $admin = User::query()->where('username', '10010001')->firstOrFail();
        $valent = User::query()->where('username', '10010002')->firstOrFail();
        $kerani = User::query()->where('username', '10010003')->firstOrFail();
        $asisten = User::query()->where('username', '10010004')->firstOrFail();
        $supir = User::query()->where('username', '10010005')->firstOrFail();
        $checker = User::query()->where('username', '10010006')->firstOrFail();

        $this->actingAs($kerani)->get(route('system-monitor.index'))->assertForbidden();
        $this->actingAs($asisten)->get(route('system-monitor.index'))->assertForbidden();
        $this->actingAs($supir)->get(route('system-monitor.index'))->assertForbidden();
        $this->actingAs($checker)->get(route('system-monitor.index'))->assertForbidden();

        $this->actingAs($admin)->get(route('system-monitor.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('system-monitor/SystemMonitorIndex')
                ->has('overview.headline')
                ->has('overview.narrative')
                ->has('auditLogs.data')
            );

        $this->actingAs($valent)->get(route('system-monitor.index'))->assertOk();

        $export = $this->actingAs($valent)->get(route('system-monitor.export'));
        $export->assertOk();
        $this->assertStringContainsString('Penjelasan Kejadian', $export->streamedContent());
    }
}
