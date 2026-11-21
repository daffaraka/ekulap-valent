<?php

namespace Database\Seeders;

use App\Models\Block;
use App\Models\Division;
use App\Models\TphPoint;
use Illuminate\Database\Seeder;

class TphPointSeeder extends Seeder
{
    public function run(): void
    {
        $division = Division::query()->where('code', 'DIV-IV')->first();

        if ($division === null || Block::query()->where('division_id', $division->id)->doesntExist()) {
            $this->call(BlockSeeder::class);
            $division = Division::query()->where('code', 'DIV-IV')->firstOrFail();
        }

        $blockIdsByCode = Block::query()
            ->where('division_id', $division->id)
            ->pluck('id', 'code');

        $points = [
            [
                'block_code' => 'F46',
                'code' => 'Stasiun 1',
                'location_label' => 'TPH 46',
                'latitude' => 3.1245100,
                'longitude' => 99.3421800,
            ],
            [
                'block_code' => 'F48',
                'code' => 'TPH 23',
                'location_label' => 'Stasiun 2 (Blok F48)',
                'latitude' => 3.1245100,
                'longitude' => 99.3421800,
            ],
            [
                'block_code' => 'I43',
                'code' => 'TPH 22',
                'location_label' => 'Stasiun 3 (Blok I43)',
                'latitude' => 3.1245100,
                'longitude' => 99.3421800,
            ],
            [
                'block_code' => 'H44',
                'code' => 'TPH 56',
                'location_label' => 'Stasiun 4 (Blok H44)',
                'latitude' => 3.1245100,
                'longitude' => 99.3421800,
            ],
            [
                'block_code' => 'G50',
                'code' => 'TPH 12',
                'location_label' => 'Stasiun 5 (Blok G50)',
                'latitude' => 3.1245100,
                'longitude' => 99.3421800,
            ],
            [
                'block_code' => 'H51',
                'code' => 'TPH 14',
                'location_label' => 'Stasiun 6 (Blok H51)',
                'latitude' => 3.1245100,
                'longitude' => 99.3421800,
            ],
            [
                'block_code' => 'I52',
                'code' => 'TPH 27',
                'location_label' => 'Stasiun 7 (Blok I52)',
                'latitude' => 3.1245100,
                'longitude' => 99.3421800,
            ],
            [
                'block_code' => 'H53',
                'code' => 'TPH 44',
                'location_label' => 'Stasiun 8 (Blok H53)',
                'latitude' => 3.1245100,
                'longitude' => 99.3421800,
            ],
        ];

        foreach ($points as $point) {
            $blockId = $blockIdsByCode->get($point['block_code']);

            if ($blockId === null) {
                $blockId = Block::query()->create([
                    'division_id' => $division->id,
                    'code' => $point['block_code'],
                    'planting_year' => 2011,
                ])->id;

                $blockIdsByCode->put($point['block_code'], $blockId);
            }

            TphPoint::query()->updateOrCreate(
                ['code' => $point['code']],
                [
                    'block_id' => $blockId,
                    'location_label' => $point['location_label'],
                    'latitude' => $point['latitude'],
                    'longitude' => $point['longitude'],
                ]
            );
        }
    }
}
