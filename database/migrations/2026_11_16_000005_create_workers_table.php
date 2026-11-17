<?php

use App\Enums\RecordStatus;
use App\Enums\WorkerJobType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('division_id')->constrained('divisions')->cascadeOnDelete();
            $table->string('worker_code', 40)->unique();
            $table->string('name');
            $table->string('job_type', 40)->default(WorkerJobType::PemanenTbs->value);
            $table->string('status', 20)->default(RecordStatus::Aktif->value);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
