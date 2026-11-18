<?php

use App\Enums\UserRole;
use App\Http\Controllers\AiAssistantController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryOrderController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\PksReconciliationController;
use App\Http\Controllers\RekapanController;
use App\Http\Controllers\SystemMonitorController;
use App\Http\Controllers\TphHarvestController;
use App\Http\Controllers\UserManagementController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role'])->group(function (): void {
    Route::get('/', function (Request $request) {
        /** @var User|null $user */
        $user = $request->user();

        if ($user?->role === UserRole::KeraniProduksi) {
            return redirect()->route('tph-harvest.index');
        }

        return app()->call([app(DashboardController::class), 'index'], ['request' => $request]);
    })->name('home');

    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('role:Admin,Supervisi/Asisten,Pimpinan (EM/RC),Supir,Checker PKS')
        ->name('dashboard');

    // Rekapan Kutip Lapis per Tanggal
    Route::middleware('role:Admin,Supervisi/Asisten,Pimpinan (EM/RC),Supir,Checker PKS')->group(function (): void {
        Route::get('rekapan-kutip-lapis', [RekapanController::class, 'index'])->name('rekapan.index');
        Route::get('rekapan-kutip-lapis/export', [RekapanController::class, 'exportCsv'])->name('rekapan.export');
    });

    // Tabel 8: Catatan Hasil & Timbang TPH
    Route::get('tph-harvest', [TphHarvestController::class, 'index'])->name('tph-harvest.index');
    Route::post('tph-harvest', [TphHarvestController::class, 'store'])
        ->middleware('role:Admin,Kerani Produksi,Supervisi/Asisten')
        ->name('tph-harvest.store');
    Route::delete('tph-harvest/{tphHarvest}', [TphHarvestController::class, 'destroy'])
        ->middleware('role:Admin,Kerani Produksi,Supervisi/Asisten')
        ->name('tph-harvest.destroy');

    // Tabel 9 & 10: Surat Jalan (SPB) & Rincian Muatan Truk
    Route::get('surat-jalan', [DeliveryOrderController::class, 'index'])->name('surat-jalan.index');
    Route::post('surat-jalan', [DeliveryOrderController::class, 'store'])
        ->middleware('role:Admin,Kerani Produksi,Supervisi/Asisten')
        ->name('surat-jalan.store');
    Route::get('surat-jalan/{deliveryOrder}', [DeliveryOrderController::class, 'show'])->name('surat-jalan.show');
    Route::post('surat-jalan/{deliveryOrder}/items', [DeliveryOrderController::class, 'addItems'])
        ->middleware('role:Admin,Kerani Produksi,Supervisi/Asisten')
        ->name('surat-jalan.add-items');
    Route::post('surat-jalan/{deliveryOrder}/dispatch', [DeliveryOrderController::class, 'dispatchOrder'])
        ->middleware('role:Admin,Kerani Produksi,Supervisi/Asisten,Supir')
        ->name('surat-jalan.dispatch');

    // Status Kutip Lapis & Rekonsiliasi Timbangan PKS
    Route::get('pks-reconciliation', [PksReconciliationController::class, 'index'])->name('pks-reconciliation.index');
    Route::post('pks-reconciliation/{deliveryOrder}/weigh', [PksReconciliationController::class, 'weigh'])
        ->middleware('role:Admin,Checker PKS,Supervisi/Asisten')
        ->name('pks-reconciliation.weigh');
    Route::get('pks-reconciliation/export', [PksReconciliationController::class, 'exportCsv'])->name('pks-reconciliation.export');

    // Asisten AI Sawit (Laravel AI SDK)
    Route::middleware('role:Admin,Supervisi/Asisten,Pimpinan (EM/RC),Supir,Checker PKS')->group(function (): void {
        Route::get('ai-assistant', [AiAssistantController::class, 'index'])->name('ai-assistant.index');
        Route::post('ai-assistant/ask', [AiAssistantController::class, 'ask'])->name('ai-assistant.ask');
    });

    // Master Data (Tabel 2 - 7)
    Route::get('master-data', [MasterDataController::class, 'index'])
        ->middleware('role:Admin,Supervisi/Asisten,Pimpinan (EM/RC)')
        ->name('master-data.index');
    Route::middleware('role:Admin,Supervisi/Asisten')->group(function (): void {
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

    // Tabel 1: Manajemen Pengguna Aplikasi (Khusus Admin; Supervisi/Asisten tidak diizinkan)
    Route::middleware('role:Admin')->group(function (): void {
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::post('users', [UserManagementController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::patch('users/{user}/toggle', [UserManagementController::class, 'toggleStatus'])->name('users.toggle');
    });

    // Monitor Kesehatan Aplikasi, Upload & Keamanan Login/Aktivitas (Khusus Admin & Pimpinan)
    Route::middleware('role:Admin,Pimpinan (EM/RC)')->group(function (): void {
        Route::get('system-monitor', [SystemMonitorController::class, 'index'])->name('system-monitor.index');
        Route::get('system-monitor/export', [SystemMonitorController::class, 'exportCsv'])->name('system-monitor.export');
    });
});

require __DIR__.'/settings.php';
