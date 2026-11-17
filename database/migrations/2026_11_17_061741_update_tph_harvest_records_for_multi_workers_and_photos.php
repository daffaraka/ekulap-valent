<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tph_harvest_records', function (Blueprint $table): void {
            $table->unsignedInteger('tph_count')->default(1)->after('sack_count');
            $table->foreignId('weigher_user_id')
                ->nullable()
                ->after('recorder_user_id')
                ->constrained('users')
                ->nullOnDelete();
            $table->json('photo_paths')->nullable()->after('photo_path');
        });

        Schema::create('tph_harvest_record_worker', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tph_harvest_record_id')->constrained('tph_harvest_records')->cascadeOnDelete();
            $table->foreignId('worker_id')->constrained('workers')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['tph_harvest_record_id', 'worker_id'], 'tph_record_worker_unique');
        });

        $existing = DB::table('tph_harvest_records')
            ->select(['id', 'worker_id', 'recorder_user_id', 'photo_path'])
            ->get();

        foreach ($existing as $row) {
            DB::table('tph_harvest_records')
                ->where('id', $row->id)
                ->update([
                    'weigher_user_id' => $row->recorder_user_id,
                    'photo_paths' => $row->photo_path ? json_encode([$row->photo_path]) : null,
                ]);

            if ($row->worker_id !== null) {
                DB::table('tph_harvest_record_worker')->insert([
                    'tph_harvest_record_id' => $row->id,
                    'worker_id' => $row->worker_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tph_harvest_record_worker');

        Schema::table('tph_harvest_records', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('weigher_user_id');
            $table->dropColumn(['tph_count', 'photo_paths']);
        });
    }
};
