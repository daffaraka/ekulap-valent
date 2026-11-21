<?php

namespace Database\Seeders;

use App\Services\RbacCatalog;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(RbacCatalog::class)->syncDefaults(overwriteExistingRoles: false);
    }
}
