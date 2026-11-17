<?php

use App\Enums\RecordStatus;
use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('username', 80)->nullable()->unique()->after('name');
            $table->string('phone', 32)->nullable()->unique()->after('username');
            $table->string('role', 40)->default(UserRole::KeraniProduksi->value)->after('password');
            $table->foreignId('division_id')->nullable()->after('role')->constrained('divisions')->nullOnDelete();
            $table->string('status', 20)->default(RecordStatus::Aktif->value)->after('division_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('division_id');
            $table->dropColumn(['username', 'phone', 'role', 'status']);
        });
    }
};
