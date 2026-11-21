<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tph_harvest_record_block', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tph_harvest_record_id')->constrained('tph_harvest_records')->cascadeOnDelete();
            $table->foreignId('block_id')->constrained('blocks')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['tph_harvest_record_id', 'block_id'], 'tph_record_block_unique');
        });

        $existing = DB::table('tph_harvest_records')
            ->select(['id', 'block_id'])
            ->whereNotNull('block_id')
            ->get();

        $now = now();
        foreach ($existing as $row) {
            DB::table('tph_harvest_record_block')->insertOrIgnore([
                'tph_harvest_record_id' => $row->id,
                'block_id' => $row->block_id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tph_harvest_record_block');
    }
};
