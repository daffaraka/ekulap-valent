<?php

namespace Database\Seeders;

use App\Models\Block;
use App\Models\Division;
use Illuminate\Database\Seeder;

class BlockSeeder extends Seeder
{
    public function run(): void
    {
        $division = Division::query()->firstOrCreate(
            ['code' => 'DIV-IV'],
            ['name' => 'Divisi IV Jalemo Estate']
        );

        $blocks = [
            ['code' => 'F46', 'planting_year' => 2011],
            ['code' => 'F47', 'planting_year' => 2011],
            ['code' => 'F48', 'planting_year' => 2011],
            ['code' => 'F49', 'planting_year' => 2011],
            ['code' => 'G44', 'planting_year' => 2011],
            ['code' => 'G45', 'planting_year' => 2011],
            ['code' => 'G49', 'planting_year' => 2011],
            ['code' => 'G50', 'planting_year' => 2011],
            ['code' => 'G51', 'planting_year' => 2011],
            ['code' => 'H43', 'planting_year' => 2011],
            ['code' => 'H44', 'planting_year' => 2011],
            ['code' => 'H45', 'planting_year' => 2011],
            ['code' => 'H47', 'planting_year' => 2011],
            ['code' => 'I43', 'planting_year' => 2011],
            ['code' => 'H50', 'planting_year' => 2012],
            ['code' => 'H51', 'planting_year' => 2012],
            ['code' => 'H52', 'planting_year' => 2012],
            ['code' => 'H53', 'planting_year' => 2012],
            ['code' => 'H54', 'planting_year' => 2012],
            ['code' => 'G52', 'planting_year' => 2012],
            ['code' => 'G53', 'planting_year' => 2012],
            ['code' => 'G54', 'planting_year' => 2012],
            ['code' => 'I52', 'planting_year' => 2012],
        ];

        foreach ($blocks as $block) {
            Block::query()->updateOrCreate(
                [
                    'division_id' => $division->id,
                    'code' => $block['code'],
                ],
                [
                    'planting_year' => $block['planting_year'],
                ]
            );
        }
    }
}
