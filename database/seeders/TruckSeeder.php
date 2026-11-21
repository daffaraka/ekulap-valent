<?php

namespace Database\Seeders;

use App\Models\Truck;
use Illuminate\Database\Seeder;

class TruckSeeder extends Seeder
{
    public function run(): void
    {
        $trucks = [
            [
                'plate_number' => 'KH 8677 LH',
                'driver_name' => 'Walmudi',
                'driver_phone' => '19837402',
                'capacity_kg' => 8000,
            ],
        ];

        foreach ($trucks as $truck) {
            Truck::query()->updateOrCreate(
                ['plate_number' => $truck['plate_number']],
                [
                    'driver_name' => $truck['driver_name'],
                    'driver_phone' => $truck['driver_phone'],
                    'capacity_kg' => $truck['capacity_kg'],
                ]
            );
        }
    }
}
