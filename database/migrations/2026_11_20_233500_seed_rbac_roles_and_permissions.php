<?php

use App\Services\RbacCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        app(RbacCatalog::class)->syncDefaults(overwriteExistingRoles: true);
    }

    public function down(): void
    {
        // Data seed RBAC tidak dihapus otomatis pada rollback parsial;
        // tabel roles/permissions dibersihkan oleh migrasi create_permission_tables.
    }
};
