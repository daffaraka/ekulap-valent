<?php

namespace Database\Seeders;

use App\Models\PksMill;
use Illuminate\Database\Seeder;

class PksMillSeeder extends Seeder
{
    public function run(): void
    {
        $mills = [
            [
                'code' => '4250',
                'name' => 'Jalemo Mill',
            ],
        ];

        foreach ($mills as $mill) {
            PksMill::query()->updateOrCreate(
                ['code' => $mill['code']],
                ['name' => $mill['name']]
            );
        }
    }
}
