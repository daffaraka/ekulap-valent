<?php

use App\Enums\RecordStatus;
use App\Models\Block;
use App\Models\Division;
use App\Models\PksMill;
use App\Models\TphPoint;
use App\Models\Truck;
use App\Models\Worker;
use Database\Seeders\BlockSeeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PksMillSeeder;
use Database\Seeders\TphPointSeeder;
use Database\Seeders\TruckSeeder;
use Database\Seeders\WorkerSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('master data seeders populate blocks, tph points, workers, trucks, and pks mills idempotently', function () {
    $seeders = [
        BlockSeeder::class,
        TphPointSeeder::class,
        WorkerSeeder::class,
        TruckSeeder::class,
        PksMillSeeder::class,
    ];

    $this->seed($seeders);
    $this->seed($seeders);

    $division = Division::query()->where('code', 'DIV-IV')->firstOrFail();

    expect(Block::query()->where('division_id', $division->id)->count())->toBe(23)
        ->and(Block::query()->where('division_id', $division->id)->where('code', 'F46')->value('planting_year'))->toBe(2011)
        ->and(Block::query()->where('division_id', $division->id)->where('code', 'I52')->value('planting_year'))->toBe(2012)
        ->and(TphPoint::query()->count())->toBe(8)
        ->and(TphPoint::query()->where('code', 'Stasiun 1')->first()?->block?->code)->toBe('F46')
        ->and(TphPoint::query()->where('code', 'TPH 44')->first()?->block?->code)->toBe('H53')
        ->and(Worker::query()->where('division_id', $division->id)->count())->toBe(3)
        ->and(Worker::query()->where('worker_code', '2597464')->first()?->status)->toBe(RecordStatus::Aktif)
        ->and(Worker::query()->where('worker_code', 'Apri Piliyanto')->first()?->status)->toBe(RecordStatus::Nonaktif)
        ->and(Worker::query()->where('worker_code', '269368')->first()?->status)->toBe(RecordStatus::Aktif)
        ->and(Truck::query()->count())->toBe(1)
        ->and(Truck::query()->where('plate_number', 'KH 8677 LH')->value('driver_name'))->toBe('Walmudi')
        ->and(PksMill::query()->count())->toBe(1)
        ->and(PksMill::query()->where('code', '4250')->value('name'))->toBe('Jalemo Mill');
});

test('tph point seeder can run standalone when blocks have not been seeded yet', function () {
    $this->seed(TphPointSeeder::class);

    expect(Block::query()->count())->toBe(23)
        ->and(TphPoint::query()->count())->toBe(8);
});

test('database seeder includes blocks, tph points, workers, trucks, and pks mills', function () {
    $this->seed(DatabaseSeeder::class);

    expect(Block::query()->count())->toBe(23)
        ->and(TphPoint::query()->count())->toBe(8)
        ->and(Worker::query()->count())->toBe(3)
        ->and(Truck::query()->count())->toBe(1)
        ->and(PksMill::query()->count())->toBe(1);
});
