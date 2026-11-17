<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_orders', function (Blueprint $table): void {
            $table->id();
            $table->string('spb_number', 40)->unique();
            $table->foreignId('division_id')->constrained('divisions')->restrictOnDelete();
            $table->foreignId('truck_id')->constrained('trucks')->restrictOnDelete();
            $table->foreignId('pks_mill_id')->constrained('pks_mills')->restrictOnDelete();
            $table->foreignId('loader_user_id')->constrained('users')->restrictOnDelete();
            $table->unsignedInteger('total_sacks_loaded')->default(0);
            $table->decimal('total_estimated_kg', 10, 2)->default(0);
            $table->timestamp('departed_at')->nullable();
            $table->string('pks_ticket_number', 64)->nullable();
            $table->decimal('pks_net_weight_kg', 10, 2)->nullable();
            $table->decimal('weight_shrinkage_kg', 10, 2)->nullable();
            $table->string('pks_slip_photo_path')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->string('delivery_status', 32)->default('Proses Muat')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_orders');
    }
};
