<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('delivery_orders', function (Blueprint $table): void {
            $table->string('notes', 500)->nullable()->after('pks_mill_id');
            $table->json('loading_photo_paths')->nullable()->after('total_estimated_kg');
        });

        DB::table('delivery_orders')
            ->where('delivery_status', 'Proses Muat')
            ->update(['delivery_status' => 'Belum Muat']);

        DB::table('delivery_orders')
            ->whereIn('delivery_status', ['Dalam Perjalanan', 'Sudah Diterima PKS'])
            ->update(['delivery_status' => 'Sudah Dikirim']);
    }

    public function down(): void
    {
        DB::table('delivery_orders')
            ->where('delivery_status', 'Belum Muat')
            ->update(['delivery_status' => 'Proses Muat']);

        DB::table('delivery_orders')
            ->where('delivery_status', 'Sudah Dikirim')
            ->update(['delivery_status' => 'Dalam Perjalanan']);

        Schema::table('delivery_orders', function (Blueprint $table): void {
            $table->dropColumn(['notes', 'loading_photo_paths']);
        });
    }
};
