<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Enums\WorkerJobType;
use App\Models\Division;
use App\Models\Worker;
use Illuminate\Database\Seeder;

class WorkerSeeder extends Seeder
{
    public function run(): void
    {
        $division = Division::query()->firstOrCreate(
            ['code' => 'DIV-IV'],
            ['name' => 'Divisi IV Jalemo Estate']
        );

        $workers = [
            [
                'worker_code' => '2597464',
                'name' => 'Ajeka Carlos',
                'job_type' => WorkerJobType::KutipLapisBrondolan,
                'status' => RecordStatus::Aktif,
            ],
            [
                'worker_code' => 'Apri Piliyanto',
                'name' => '2693968',
                'job_type' => WorkerJobType::KutipLapisBrondolan,
                'status' => RecordStatus::Nonaktif,
            ],
            [
                'worker_code' => '269368',
                'name' => 'Apri Piliyanto',
                'job_type' => WorkerJobType::KutipLapisBrondolan,
                'status' => RecordStatus::Aktif,
            ],
        ];

        foreach ($workers as $worker) {
            Worker::query()->updateOrCreate(
                ['worker_code' => $worker['worker_code']],
                [
                    'division_id' => $division->id,
                    'name' => $worker['name'],
                    'job_type' => $worker['job_type'],
                    'status' => $worker['status'],
                ]
            );
        }
    }
}
