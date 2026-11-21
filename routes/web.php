<?php

use App\Http\Controllers\AiAssistantController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryOrderController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\PksReconciliationController;
use App\Http\Controllers\RekapanController;
use App\Http\Controllers\RoleManagementController;
use App\Http\Controllers\SystemMonitorController;
use App\Http\Controllers\TphHarvestController;
use App\Http\Controllers\UserManagementController;
use App\Models\User;
use App\Services\RbacCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'active'])->group(function (): void {
    Route::get('/', function (Request $request) {
        /** @var User|null $user */
        $user = $request->user();

        if ($user instanceof User) {
            $homeRoute = app(RbacCatalog::class)->homeRouteFor($user);
            if ($homeRoute !== 'dashboard') {
                return redirect()->route($homeRoute);
            }
        }

        return app()->call([app(DashboardController::class), 'index'], ['request' => $request]);
    })->name('home');

    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    // Rekapan Kutip Lapis per Tanggal & Stasiun
    Route::get('rekapan-kutip-lapis', [RekapanController::class, 'index'])
        ->middleware('permission:rekapan.view')
        ->name('rekapan.index');
    Route::get('rekapan-kutip-lapis/export', [RekapanController::class, 'exportCsv'])
        ->middleware('permission:rekapan.export')
        ->name('rekapan.export');

    // Tabel 8: Catatan Hasil & Timbang TPH
    Route::get('tph-harvest', [TphHarvestController::class, 'index'])
        ->middleware('permission:tph-harvest.view')
        ->name('tph-harvest.index');
    Route::post('tph-harvest', [TphHarvestController::class, 'store'])
        ->middleware('permission:tph-harvest.create')
        ->name('tph-harvest.store');
    Route::delete('tph-harvest/{tphHarvest}', [TphHarvestController::class, 'destroy'])
        ->middleware('permission:tph-harvest.delete')
        ->name('tph-harvest.destroy');

    // Tabel 9 & 10: Surat Jalan (SPB) & Rincian Muatan Truk
    Route::get('surat-jalan', [DeliveryOrderController::class, 'index'])
        ->middleware('permission:surat-jalan.view')
        ->name('surat-jalan.index');
    Route::post('surat-jalan', [DeliveryOrderController::class, 'store'])
        ->middleware('permission:surat-jalan.create')
        ->name('surat-jalan.store');
    Route::get('surat-jalan/{deliveryOrder}', [DeliveryOrderController::class, 'show'])
        ->middleware('permission:surat-jalan.view')
        ->name('surat-jalan.show');
    Route::post('surat-jalan/{deliveryOrder}/items', [DeliveryOrderController::class, 'addItems'])
        ->middleware('permission:surat-jalan.create')
        ->name('surat-jalan.add-items');
    Route::post('surat-jalan/{deliveryOrder}/dispatch', [DeliveryOrderController::class, 'dispatchOrder'])
        ->middleware('permission:surat-jalan.dispatch')
        ->name('surat-jalan.dispatch');

    // Status Kutip Lapis & Rekonsiliasi Timbangan PKS
    Route::get('pks-reconciliation', [PksReconciliationController::class, 'index'])
        ->middleware('permission:pks-reconciliation.view')
        ->name('pks-reconciliation.index');
    Route::post('pks-reconciliation/{deliveryOrder}/weigh', [PksReconciliationController::class, 'weigh'])
        ->middleware('permission:pks-reconciliation.weigh')
        ->name('pks-reconciliation.weigh');
    Route::get('pks-reconciliation/export', [PksReconciliationController::class, 'exportCsv'])
        ->middleware('permission:pks-reconciliation.export')
        ->name('pks-reconciliation.export');

    // Asisten AI Sawit (Laravel AI SDK)
    Route::middleware('permission:ai-assistant.use')->group(function (): void {
        Route::get('ai-assistant', [AiAssistantController::class, 'index'])->name('ai-assistant.index');
        Route::post('ai-assistant/ask', [AiAssistantController::class, 'ask'])->name('ai-assistant.ask');
    });

    // Master Data (Tabel 2 - 7)
    Route::get('master-data', [MasterDataController::class, 'index'])
        ->middleware('permission:master-data.view')
        ->name('master-data.index');
    Route::middleware('permission:master-data.manage')->group(function (): void {
        Route::post('master-data/divisions', [MasterDataController::class, 'storeDivision'])->name('master-data.divisions.store');
        Route::delete('master-data/divisions/{division}', [MasterDataController::class, 'destroyDivision'])->name('master-data.divisions.destroy');
        Route::post('master-data/blocks', [MasterDataController::class, 'storeBlock'])->name('master-data.blocks.store');
        Route::delete('master-data/blocks/{block}', [MasterDataController::class, 'destroyBlock'])->name('master-data.blocks.destroy');
        Route::post('master-data/tph-points', [MasterDataController::class, 'storeTphPoint'])->name('master-data.tph-points.store');
        Route::delete('master-data/tph-points/{tphPoint}', [MasterDataController::class, 'destroyTphPoint'])->name('master-data.tph-points.destroy');
        Route::post('master-data/workers', [MasterDataController::class, 'storeWorker'])->name('master-data.workers.store');
        Route::patch('master-data/workers/{worker}/toggle', [MasterDataController::class, 'toggleWorkerStatus'])->name('master-data.workers.toggle');
        Route::post('master-data/trucks', [MasterDataController::class, 'storeTruck'])->name('master-data.trucks.store');
        Route::delete('master-data/trucks/{truck}', [MasterDataController::class, 'destroyTruck'])->name('master-data.trucks.destroy');
        Route::post('master-data/pks-mills', [MasterDataController::class, 'storePksMill'])->name('master-data.pks-mills.store');
        Route::delete('master-data/pks-mills/{pksMill}', [MasterDataController::class, 'destroyPksMill'])->name('master-data.pks-mills.destroy');
    });

    // Tabel 1: Manajemen Pengguna Aplikasi
    Route::get('users', [UserManagementController::class, 'index'])
        ->middleware('permission:users.view')
        ->name('users.index');
    Route::middleware('permission:users.manage')->group(function (): void {
        Route::post('users', [UserManagementController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::patch('users/{user}/toggle', [UserManagementController::class, 'toggleStatus'])->name('users.toggle');
    });

    // Manajemen Role & Matriks Permission (RBAC)
    Route::get('roles', [RoleManagementController::class, 'index'])
        ->middleware('permission:roles.view')
        ->name('roles.index');
    Route::middleware('permission:roles.manage')->group(function (): void {
        Route::post('roles', [RoleManagementController::class, 'store'])->name('roles.store');
        Route::put('roles/{role}/permissions', [RoleManagementController::class, 'updatePermissions'])->name('roles.update-permissions');
        Route::delete('roles/{role}', [RoleManagementController::class, 'destroy'])->name('roles.destroy');
    });

    // Monitor Kesehatan Aplikasi, Upload & Keamanan Login/Aktivitas
    Route::get('system-monitor', [SystemMonitorController::class, 'index'])
        ->middleware('permission:system-monitor.view')
        ->name('system-monitor.index');
    Route::get('system-monitor/export', [SystemMonitorController::class, 'exportCsv'])
        ->middleware('permission:system-monitor.export')
        ->name('system-monitor.export');
});

require __DIR__.'/settings.php';
