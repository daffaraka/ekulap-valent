<?php

use App\Enums\HarvestType;
use App\Enums\TransportStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tph_harvest_records', function (Blueprint $table): void {
            $table->id();
            $table->string('lot_number', 40)->unique();
            $table->date('work_date')->index();
            $table->foreignId('division_id')->constrained('divisions')->restrictOnDelete();
            $table->foreignId('block_id')->constrained('blocks')->restrictOnDelete();
            $table->foreignId('tph_point_id')->constrained('tph_points')->restrictOnDelete();
            $table->foreignId('worker_id')->constrained('workers')->restrictOnDelete();
            $table->foreignId('recorder_user_id')->constrained('users')->restrictOnDelete();
            $table->string('harvest_type', 32)->default(HarvestType::Brondolan->value);
            $table->unsignedInteger('sack_count');
            $table->unsignedInteger('bunch_count')->nullable();
            $table->decimal('gross_weight_kg', 10, 2);
            $table->decimal('sack_deduction_kg', 10, 2)->default(0);
            $table->decimal('net_weight_kg', 10, 2);
            $table->string('photo_path')->nullable();
            $table->decimal('input_latitude', 10, 7)->nullable();
            $table->decimal('input_longitude', 10, 7)->nullable();
            $table->decimal('gps_distance_meters', 10, 2)->nullable();
            $table->timestamp('weighed_at');
            $table->string('transport_status', 32)->default(TransportStatus::BelumDiangkut->value)->index();
            $table->unsignedInteger('loaded_sack_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tph_harvest_records');
    }
};
