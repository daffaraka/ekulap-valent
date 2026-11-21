<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RbacCatalog
{
    public const string GUARD = 'web';

    /**
     * @return list<array{
     *     key: string,
     *     label: string,
     *     description: string,
     *     permissions: list<array{name: string, label: string, description: string}>
     * }>
     */
    public function permissionGroups(): array
    {
        return [
            [
                'key' => 'dashboard',
                'label' => 'Dashboard Eksekutif',
                'description' => 'Ringkasan KPI, grafik distribusi status karung, dan aktivitas terbaru.',
                'permissions' => [
                    [
                        'name' => 'dashboard.view',
                        'label' => 'Lihat Dashboard Eksekutif',
                        'description' => 'Akses halaman utama dashboard dan statistik operasional.',
                    ],
                ],
            ],
            [
                'key' => 'tph-harvest',
                'label' => 'Catatan Hasil & Timbang TPH',
                'description' => 'Pencatatan karung panen, berat timbang, pekerja, dan dokumentasi lapangan.',
                'permissions' => [
                    [
                        'name' => 'tph-harvest.view',
                        'label' => 'Lihat Catatan Timbang TPH',
                        'description' => 'Melihat daftar dan detail catatan timbang TPH.',
                    ],
                    [
                        'name' => 'tph-harvest.create',
                        'label' => 'Input Catatan Timbang TPH',
                        'description' => 'Menambahkan catatan hasil panen dan timbang TPH baru.',
                    ],
                    [
                        'name' => 'tph-harvest.delete',
                        'label' => 'Hapus Catatan Timbang TPH',
                        'description' => 'Menghapus catatan timbang TPH yang belum dimuat ke SPB.',
                    ],
                ],
            ],
            [
                'key' => 'surat-jalan',
                'label' => 'Surat Jalan & Muat Truk (SPB)',
                'description' => 'Pembuatan SPB, pemuatan karung ke truk, dan pengiriman menuju PKS.',
                'permissions' => [
                    [
                        'name' => 'surat-jalan.view',
                        'label' => 'Lihat Daftar & Detail SPB',
                        'description' => 'Melihat daftar, rincian, dan cetak dokumen Surat Jalan.',
                    ],
                    [
                        'name' => 'surat-jalan.create',
                        'label' => 'Buat SPB & Tambah Muatan',
                        'description' => 'Membuat SPB baru dan menambahkan muatan karung dari TPH.',
                    ],
                    [
                        'name' => 'surat-jalan.dispatch',
                        'label' => 'Kirim / Berangkatkan SPB',
                        'description' => 'Mengubah status SPB menjadi Sudah Dikirim beserta foto muat.',
                    ],
                ],
            ],
            [
                'key' => 'pks-reconciliation',
                'label' => 'Status Kutip Lapis & PKS',
                'description' => 'Pemantauan restan, pencatatan timbangan jembatan PKS, dan ekspor laporan.',
                'permissions' => [
                    [
                        'name' => 'pks-reconciliation.view',
                        'label' => 'Lihat Status Kutip Lapis & PKS',
                        'description' => 'Melihat status pengiriman SPB dan rekonsiliasi PKS.',
                    ],
                    [
                        'name' => 'pks-reconciliation.weigh',
                        'label' => 'Input Timbangan & Tiket PKS',
                        'description' => 'Mencatat nomor tiket, berat bersih PKS, dan slip timbang.',
                    ],
                    [
                        'name' => 'pks-reconciliation.export',
                        'label' => 'Ekspor CSV Status Kutip Lapis',
                        'description' => 'Mengunduh laporan status pengiriman dan susut PKS (CSV).',
                    ],
                ],
            ],
            [
                'key' => 'rekapan',
                'label' => 'Rekapan Hasil Kutip Lapis',
                'description' => 'Rekapan panen per tanggal kerja dan pantauan umur restan per stasiun TPH.',
                'permissions' => [
                    [
                        'name' => 'rekapan.view',
                        'label' => 'Lihat Rekapan Harian & Stasiun',
                        'description' => 'Melihat tabel rekapan harian, restan stasiun, dan detailnya.',
                    ],
                    [
                        'name' => 'rekapan.export',
                        'label' => 'Ekspor CSV Rekapan',
                        'description' => 'Mengunduh laporan rekapan harian dan restan stasiun (CSV).',
                    ],
                ],
            ],
            [
                'key' => 'ai-assistant',
                'label' => 'Asisten AI Sawit',
                'description' => 'Analisis operasional, antrean restan, susut PKS, dan audit GPS berbasis AI.',
                'permissions' => [
                    [
                        'name' => 'ai-assistant.use',
                        'label' => 'Gunakan Asisten AI Sawit',
                        'description' => 'Mengakses halaman Asisten AI dan mengajukan pertanyaan analisis.',
                    ],
                ],
            ],
            [
                'key' => 'master-data',
                'label' => 'Master Data Kebun & Armada',
                'description' => 'Pengelolaan divisi, blok, titik TPH, tenaga kerja, armada truk, dan PKS.',
                'permissions' => [
                    [
                        'name' => 'master-data.view',
                        'label' => 'Lihat Master Data',
                        'description' => 'Melihat seluruh tabel referensi master data operasional.',
                    ],
                    [
                        'name' => 'master-data.manage',
                        'label' => 'Kelola Master Data',
                        'description' => 'Menambah, mengubah status, dan menghapus entri master data.',
                    ],
                ],
            ],
            [
                'key' => 'users',
                'label' => 'Manajemen Pengguna',
                'description' => 'Pengelolaan akun login petugas (NIK), jabatan/role, divisi, dan status aktif.',
                'permissions' => [
                    [
                        'name' => 'users.view',
                        'label' => 'Lihat Daftar Pengguna',
                        'description' => 'Melihat daftar akun pengguna aplikasi eKULAP.',
                    ],
                    [
                        'name' => 'users.manage',
                        'label' => 'Kelola Pengguna',
                        'description' => 'Menambah, mengedit, dan mengaktifkan/menonaktifkan akun pengguna.',
                    ],
                ],
            ],
            [
                'key' => 'roles',
                'label' => 'Role & Hak Akses (RBAC)',
                'description' => 'Pengaturan peran jabatan dan matriks izin akses per modul aplikasi.',
                'permissions' => [
                    [
                        'name' => 'roles.view',
                        'label' => 'Lihat Role & Matriks Izin',
                        'description' => 'Melihat daftar role dan matriks permission tiap role.',
                    ],
                    [
                        'name' => 'roles.manage',
                        'label' => 'Kelola Role & Ubah Matriks Izin',
                        'description' => 'Membuat role baru, mengubah izin role, dan menghapus role kustom.',
                    ],
                ],
            ],
            [
                'key' => 'system-monitor',
                'label' => 'Monitor Sistem & Audit Log',
                'description' => 'Pemantauan kesehatan aplikasi, kendala upload, dan riwayat aktivitas keamanan.',
                'permissions' => [
                    [
                        'name' => 'system-monitor.view',
                        'label' => 'Lihat Monitor Kesehatan & Log',
                        'description' => 'Melihat status kesehatan sistem dan riwayat audit aktivitas.',
                    ],
                    [
                        'name' => 'system-monitor.export',
                        'label' => 'Ekspor CSV Log Audit',
                        'description' => 'Mengunduh riwayat aktivitas audit keamanan dalam format CSV.',
                    ],
                ],
            ],
        ];
    }

    /**
     * @return list<string>
     */
    public function allPermissionNames(): array
    {
        $names = [];
        foreach ($this->permissionGroups() as $group) {
            foreach ($group['permissions'] as $permission) {
                $names[] = $permission['name'];
            }
        }

        return $names;
    }

    /**
     * @return list<string>
     */
    public function systemRoleNames(): array
    {
        return UserRole::values();
    }

    public function isSystemRole(string $roleName): bool
    {
        return in_array($roleName, $this->systemRoleNames(), true);
    }

    /**
     * @return array<string, list<string>>
     */
    public function defaultRolePermissions(): array
    {
        return [
            UserRole::Admin->value => $this->allPermissionNames(),
            UserRole::KeraniProduksi->value => [
                'tph-harvest.view',
                'tph-harvest.create',
                'tph-harvest.delete',
                'surat-jalan.view',
                'surat-jalan.create',
                'surat-jalan.dispatch',
                'pks-reconciliation.view',
                'pks-reconciliation.export',
            ],
            UserRole::SupervisiAsisten->value => [
                'dashboard.view',
                'tph-harvest.view',
                'tph-harvest.create',
                'tph-harvest.delete',
                'surat-jalan.view',
                'surat-jalan.create',
                'surat-jalan.dispatch',
                'pks-reconciliation.view',
                'pks-reconciliation.weigh',
                'pks-reconciliation.export',
                'rekapan.view',
                'rekapan.export',
                'ai-assistant.use',
                'master-data.view',
                'master-data.manage',
            ],
            UserRole::Pimpinan->value => [
                'dashboard.view',
                'tph-harvest.view',
                'surat-jalan.view',
                'pks-reconciliation.view',
                'pks-reconciliation.export',
                'rekapan.view',
                'rekapan.export',
                'ai-assistant.use',
                'master-data.view',
                'system-monitor.view',
                'system-monitor.export',
            ],
            UserRole::Supir->value => [
                'dashboard.view',
                'tph-harvest.view',
                'surat-jalan.view',
                'surat-jalan.dispatch',
                'pks-reconciliation.view',
                'pks-reconciliation.export',
                'rekapan.view',
                'rekapan.export',
                'ai-assistant.use',
            ],
            UserRole::CheckerPks->value => [
                'dashboard.view',
                'tph-harvest.view',
                'surat-jalan.view',
                'pks-reconciliation.view',
                'pks-reconciliation.weigh',
                'pks-reconciliation.export',
                'rekapan.view',
                'rekapan.export',
                'ai-assistant.use',
            ],
        ];
    }

    public function syncDefaults(bool $overwriteExistingRoles = false): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ($this->allPermissionNames() as $permissionName) {
            Permission::findOrCreate($permissionName, self::GUARD);
        }

        foreach ($this->defaultRolePermissions() as $roleName => $permissions) {
            $role = Role::query()->where('name', $roleName)->where('guard_name', self::GUARD)->first();
            $wasNewlyCreated = false;

            if (! $role instanceof Role) {
                $role = Role::create([
                    'name' => $roleName,
                    'guard_name' => self::GUARD,
                ]);
                $wasNewlyCreated = true;
            }

            if ($wasNewlyCreated || $overwriteExistingRoles || $roleName === UserRole::Admin->value) {
                $role->syncPermissions($permissions);
            }
        }

        $this->backfillUserRoles();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function backfillUserRoles(): void
    {
        $roleMap = Role::query()
            ->where('guard_name', self::GUARD)
            ->pluck('id', 'name')
            ->all();

        $users = User::query()->select(['id', 'role'])->get();
        $modelType = (new User)->getMorphClass();

        foreach ($users as $user) {
            $roleName = trim((string) $user->role);
            if ($roleName === '' || ! isset($roleMap[$roleName])) {
                continue;
            }

            $roleId = (int) $roleMap[$roleName];
            $exists = DB::table(config('permission.table_names.model_has_roles', 'model_has_roles'))
                ->where('role_id', $roleId)
                ->where('model_type', $modelType)
                ->where('model_id', $user->id)
                ->exists();

            if (! $exists) {
                DB::table(config('permission.table_names.model_has_roles', 'model_has_roles'))->insert([
                    'role_id' => $roleId,
                    'model_type' => $modelType,
                    'model_id' => $user->id,
                ]);
            }
        }
    }

    public function homeRouteFor(User $user): string
    {
        $candidates = [
            'dashboard.view' => 'dashboard',
            'tph-harvest.view' => 'tph-harvest.index',
            'surat-jalan.view' => 'surat-jalan.index',
            'pks-reconciliation.view' => 'pks-reconciliation.index',
            'rekapan.view' => 'rekapan.index',
            'ai-assistant.use' => 'ai-assistant.index',
            'master-data.view' => 'master-data.index',
            'users.view' => 'users.index',
            'roles.view' => 'roles.index',
            'system-monitor.view' => 'system-monitor.index',
        ];

        foreach ($candidates as $permission => $routeName) {
            if ($user->can($permission)) {
                return $routeName;
            }
        }

        return 'profile.edit';
    }
}
