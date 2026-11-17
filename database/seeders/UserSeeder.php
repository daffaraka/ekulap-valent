<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Enums\UserRole;
use App\Models\Division;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $divIv = Division::query()->updateOrCreate(
            ['code' => 'DIV-IV'],
            ['name' => 'Divisi IV Jalemo Estate']
        );

        $divIi = Division::query()->updateOrCreate(
            ['code' => 'DIV-II'],
            ['name' => 'Divisi II Bukit Sari Estate']
        );

        $password = Hash::make('password');

        $users = [
            [
                'username' => '10010001',
                'name' => 'Erik Harahap',
                'phone' => '081260001001',
                'email' => 'erik.harahap@ekulap.sinarmas.co.id',
                'role' => UserRole::Admin,
                'division_id' => null,
                'status' => RecordStatus::Aktif,
            ],
            [
                'username' => '10010002',
                'name' => 'Valent',
                'phone' => '081260001002',
                'email' => 'valent@ekulap.sinarmas.co.id',
                'role' => UserRole::Pimpinan,
                'division_id' => null,
                'status' => RecordStatus::Aktif,
            ],
            [
                'username' => '10010003',
                'name' => 'Rizky Pratama',
                'phone' => '081260001003',
                'email' => 'rizky.kerani@ekulap.sinarmas.co.id',
                'role' => UserRole::KeraniProduksi,
                'division_id' => $divIv->id,
                'status' => RecordStatus::Aktif,
            ],
            [
                'username' => '10010004',
                'name' => 'Andi Wijaya',
                'phone' => '081260001004',
                'email' => 'andi.asisten@ekulap.sinarmas.co.id',
                'role' => UserRole::SupervisiAsisten,
                'division_id' => $divIv->id,
                'status' => RecordStatus::Aktif,
            ],
            [
                'username' => '10010005',
                'name' => 'Budi Hartono',
                'phone' => '081260001005',
                'email' => 'budi.supir@ekulap.sinarmas.co.id',
                'role' => UserRole::Supir,
                'division_id' => $divIv->id,
                'status' => RecordStatus::Aktif,
            ],
            [
                'username' => '10010006',
                'name' => 'Hendra Gunawan',
                'phone' => '081260001006',
                'email' => 'hendra.checker@ekulap.sinarmas.co.id',
                'role' => UserRole::CheckerPks,
                'division_id' => null,
                'status' => RecordStatus::Aktif,
            ],
            [
                'username' => '10010007',
                'name' => 'Darmawan',
                'phone' => '081260001007',
                'email' => 'darmawan@ekulap.sinarmas.co.id',
                'role' => UserRole::KeraniProduksi,
                'division_id' => $divIi->id,
                'status' => RecordStatus::Nonaktif,
            ],
        ];

        foreach ($users as $account) {
            User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'username' => $account['username'],
                    'name' => $account['name'],
                    'phone' => $account['phone'],
                    'email_verified_at' => now(),
                    'password' => $password,
                    'role' => $account['role'],
                    'division_id' => $account['division_id'],
                    'status' => $account['status'],
                ]
            );
        }
    }
}
