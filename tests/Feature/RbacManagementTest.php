<?php

namespace Tests\Feature;

use App\Enums\RecordStatus;
use App\Models\User;
use Database\Seeders\EkulapSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RbacManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(EkulapSeeder::class);
    }

    public function test_admin_can_view_roles_matrix_while_non_admin_is_forbidden(): void
    {
        $admin = User::query()->where('username', '10010001')->firstOrFail();
        $asisten = User::query()->where('username', '10010004')->firstOrFail();
        $kerani = User::query()->where('username', '10010003')->firstOrFail();

        $this->actingAs($admin)
            ->get(route('roles.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('roles/RolesIndex')
                ->has('roles', 6)
                ->has('permissionGroups', 10)
                ->has('auth.permissions')
            );

        $this->actingAs($asisten)->get(route('roles.index'))->assertForbidden();
        $this->actingAs($kerani)->get(route('roles.index'))->assertForbidden();
    }

    public function test_admin_can_create_custom_role_assign_to_user_and_enforce_permissions(): void
    {
        $admin = User::query()->where('username', '10010001')->firstOrFail();

        // Buat role kustom baru dengan izin terbatas
        $this->actingAs($admin)
            ->post(route('roles.store'), [
                'name' => 'Mandor Lapangan',
                'permissions' => ['tph-harvest.view', 'rekapan.view'],
            ])
            ->assertRedirect(route('roles.index'));

        /** @var Role $customRole */
        $customRole = Role::query()->where('name', 'Mandor Lapangan')->firstOrFail();
        $this->assertTrue($customRole->hasPermissionTo('tph-harvest.view'));
        $this->assertTrue($customRole->hasPermissionTo('rekapan.view'));
        $this->assertFalse($customRole->hasPermissionTo('dashboard.view'));

        // Tugaskan role kustom ke pengguna baru melalui Manajemen Pengguna
        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Surya Mandor',
                'username' => '10010088',
                'phone' => '081288881111',
                'password' => 'password123',
                'role' => 'Mandor Lapangan',
                'status' => RecordStatus::Aktif->value,
            ])
            ->assertRedirect(route('users.index'));

        /** @var User $mandor */
        $mandor = User::query()->where('username', '10010088')->firstOrFail();
        $this->assertTrue($mandor->hasRole('Mandor Lapangan'));

        // Logout admin, lalu login sebagai Mandor Lapangan -> otomatis diarahkan ke tph-harvest.index (tanpa dashboard.view)
        $this->post(route('logout'));
        $this->post(route('login.store'), [
            'email' => '10010088',
            'password' => 'password123',
        ])->assertRedirect(route('tph-harvest.index'));

        // Akses yang diizinkan vs yang ditolak
        $this->actingAs($mandor)
            ->get(route('tph-harvest.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.permissions', fn ($perms) => collect($perms)->contains('tph-harvest.view')
                    && collect($perms)->contains('rekapan.view')
                    && ! collect($perms)->contains('tph-harvest.create'))
            );

        $this->actingAs($mandor)->get(route('rekapan.index'))->assertOk();
        $this->actingAs($mandor)->get(route('dashboard'))->assertForbidden();
        $this->actingAs($mandor)->get(route('rekapan.export'))->assertForbidden();
        $this->actingAs($mandor)->get(route('master-data.index'))->assertForbidden();
        $this->actingAs($mandor)->get(route('roles.index'))->assertForbidden();
    }

    public function test_updating_role_permissions_dynamically_changes_access_immediately(): void
    {
        $admin = User::query()->where('username', '10010001')->firstOrFail();
        $supir = User::query()->where('username', '10010005')->firstOrFail();
        /** @var Role $supirRole */
        $supirRole = Role::query()->where('name', 'Supir')->firstOrFail();

        // Awalnya Supir dapat melihat Rekapan Kutip Lapis
        $this->actingAs($supir)->get(route('rekapan.index'))->assertOk();

        // Admin mencabut izin rekapan.view dari role Supir
        $this->actingAs($admin)
            ->put(route('roles.update-permissions', $supirRole), [
                'permissions' => ['dashboard.view', 'surat-jalan.view', 'surat-jalan.dispatch'],
            ])
            ->assertRedirect(route('roles.index'));

        // Akses Supir ke rekapan langsung ditolak (403)
        $this->actingAs($supir->fresh())->get(route('rekapan.index'))->assertForbidden();
        $this->actingAs($supir->fresh())->get(route('surat-jalan.index'))->assertOk();

        // Admin mengembalikan izin rekapan.view
        $this->actingAs($admin)
            ->put(route('roles.update-permissions', $supirRole), [
                'permissions' => ['dashboard.view', 'surat-jalan.view', 'surat-jalan.dispatch', 'rekapan.view'],
            ])
            ->assertRedirect(route('roles.index'));

        $this->actingAs($supir->fresh())->get(route('rekapan.index'))->assertOk();
    }

    public function test_role_deletion_and_admin_lockout_guardrails_are_enforced(): void
    {
        $admin = User::query()->where('username', '10010001')->firstOrFail();
        /** @var Role $adminRole */
        $adminRole = Role::query()->where('name', 'Admin')->firstOrFail();
        /** @var Role $keraniRole */
        $keraniRole = Role::query()->where('name', 'Kerani Produksi')->firstOrFail();

        // Izin Admin tidak dapat dikosongkan
        $this->actingAs($admin)
            ->put(route('roles.update-permissions', $adminRole), ['permissions' => []])
            ->assertRedirect(route('roles.index'))
            ->assertSessionHas('error');

        // Role sistem bawaan tidak dapat dihapus
        $this->actingAs($admin)
            ->delete(route('roles.destroy', $keraniRole))
            ->assertRedirect(route('roles.index'))
            ->assertSessionHas('error');
        $this->assertDatabaseHas('roles', ['name' => 'Kerani Produksi']);

        // Buat role kustom berdasarkan template, lalu hapus jika kosong
        $this->actingAs($admin)
            ->post(route('roles.store'), [
                'name' => 'Auditor Sementara',
                'template_role' => 'Pimpinan (EM/RC)',
            ])
            ->assertRedirect(route('roles.index'));

        /** @var Role $auditorRole */
        $auditorRole = Role::query()->where('name', 'Auditor Sementara')->firstOrFail();
        $this->assertTrue($auditorRole->hasPermissionTo('system-monitor.view'));

        // Tugaskan ke 1 user -> tidak boleh dihapus saat masih dipakai
        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Budi Auditor',
                'username' => '10010077',
                'password' => 'password123',
                'role' => 'Auditor Sementara',
                'status' => RecordStatus::Aktif->value,
            ])
            ->assertRedirect(route('users.index'));

        $this->actingAs($admin)
            ->delete(route('roles.destroy', $auditorRole))
            ->assertRedirect(route('roles.index'))
            ->assertSessionHas('error');
        $this->assertDatabaseHas('roles', ['name' => 'Auditor Sementara']);

        // Pindahkan user ke role lain, lalu role kustom berhasil dihapus
        $auditorUser = User::query()->where('username', '10010077')->firstOrFail();
        $this->actingAs($admin)
            ->put(route('users.update', $auditorUser), [
                'name' => $auditorUser->name,
                'username' => $auditorUser->username,
                'role' => 'Pimpinan (EM/RC)',
                'status' => RecordStatus::Aktif->value,
            ])
            ->assertRedirect(route('users.index'));

        $this->actingAs($admin)
            ->delete(route('roles.destroy', $auditorRole))
            ->assertRedirect(route('roles.index'))
            ->assertSessionHas('success');
        $this->assertDatabaseMissing('roles', ['name' => 'Auditor Sementara']);
    }
}
