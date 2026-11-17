<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Enums\WorkerJobType;
use App\Models\Block;
use App\Models\Division;
use App\Models\PksMill;
use App\Models\TphPoint;
use App\Models\Truck;
use App\Models\Worker;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('master-data/MasterDataIndex', [
            'activeTab' => $request->string('tab', 'divisions')->value(),
            'divisions' => Division::query()->withCount(['blocks', 'workers'])->orderBy('code')->get(),
            'blocks' => Block::query()->with('division:id,code,name')->withCount('tphPoints')->orderBy('code')->get(),
            'tphPoints' => TphPoint::query()->with('block.division:id,code,name')->orderBy('code')->get(),
            'workers' => Worker::query()->with('division:id,code,name')->orderBy('worker_code')->get(),
            'trucks' => Truck::query()->orderBy('plate_number')->get(),
            'pksMills' => PksMill::query()->orderBy('code')->get(),
            'jobTypes' => WorkerJobType::values(),
            'statuses' => RecordStatus::values(),
        ]);
    }

    public function storeDivision(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:divisions,code'],
            'name' => ['required', 'string', 'max:150'],
        ]);

        Division::create($validated);

        return redirect()->route('master-data.index', ['tab' => 'divisions'])
            ->with('success', "Divisi {$validated['code']} berhasil ditambahkan.");
    }

    public function destroyDivision(Division $division): RedirectResponse
    {
        $division->delete();

        return redirect()->route('master-data.index', ['tab' => 'divisions'])
            ->with('success', 'Divisi berhasil dihapus.');
    }

    public function storeBlock(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'division_id' => ['required', 'integer', 'exists:divisions,id'],
            'code' => ['required', 'string', 'max:32'],
            'planting_year' => ['required', 'integer', 'min:1980', 'max:2035'],
        ]);

        Block::create($validated);

        return redirect()->route('master-data.index', ['tab' => 'blocks'])
            ->with('success', "Blok {$validated['code']} berhasil ditambahkan.");
    }

    public function destroyBlock(Block $block): RedirectResponse
    {
        $block->delete();

        return redirect()->route('master-data.index', ['tab' => 'blocks'])
            ->with('success', 'Blok berhasil dihapus.');
    }

    public function storeTphPoint(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'block_id' => ['required', 'integer', 'exists:blocks,id'],
            'code' => ['required', 'string', 'max:48', 'unique:tph_points,code'],
            'location_label' => ['required', 'string', 'max:180'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        TphPoint::create($validated);

        return redirect()->route('master-data.index', ['tab' => 'tph'])
            ->with('success', "Titik TPH {$validated['code']} berhasil dikunci.");
    }

    public function destroyTphPoint(TphPoint $tphPoint): RedirectResponse
    {
        $tphPoint->delete();

        return redirect()->route('master-data.index', ['tab' => 'tph'])
            ->with('success', 'Titik TPH berhasil dihapus.');
    }

    public function storeWorker(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'division_id' => ['required', 'integer', 'exists:divisions,id'],
            'worker_code' => ['required', 'string', 'max:40', 'unique:workers,worker_code'],
            'name' => ['required', 'string', 'max:120'],
            'job_type' => ['required', Rule::in(WorkerJobType::values())],
            'status' => ['required', Rule::in(RecordStatus::values())],
        ]);

        Worker::create($validated);

        return redirect()->route('master-data.index', ['tab' => 'workers'])
            ->with('success', "Tenaga kerja {$validated['name']} berhasil didaftarkan.");
    }

    public function toggleWorkerStatus(Worker $worker): RedirectResponse
    {
        $worker->update([
            'status' => $worker->status === RecordStatus::Aktif
                ? RecordStatus::Nonaktif
                : RecordStatus::Aktif,
        ]);

        return redirect()->route('master-data.index', ['tab' => 'workers'])
            ->with('success', "Status pekerja {$worker->name} diperbarui.");
    }

    public function storeTruck(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plate_number' => ['required', 'string', 'max:32', 'unique:trucks,plate_number'],
            'driver_name' => ['required', 'string', 'max:120'],
            'driver_phone' => ['required', 'string', 'max:32'],
            'capacity_kg' => ['required', 'integer', 'min:500', 'max:50000'],
        ]);

        Truck::create($validated);

        return redirect()->route('master-data.index', ['tab' => 'trucks'])
            ->with('success', "Armada truk {$validated['plate_number']} berhasil ditambahkan.");
    }

    public function destroyTruck(Truck $truck): RedirectResponse
    {
        $truck->delete();

        return redirect()->route('master-data.index', ['tab' => 'trucks'])
            ->with('success', 'Data truk berhasil dihapus.');
    }

    public function storePksMill(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:pks_mills,code'],
            'name' => ['required', 'string', 'max:150'],
        ]);

        PksMill::create($validated);

        return redirect()->route('master-data.index', ['tab' => 'pks'])
            ->with('success', "Pabrik {$validated['name']} berhasil ditambahkan.");
    }

    public function destroyPksMill(PksMill $pksMill): RedirectResponse
    {
        $pksMill->delete();

        return redirect()->route('master-data.index', ['tab' => 'pks'])
            ->with('success', 'Pabrik PKS berhasil dihapus.');
    }
}
