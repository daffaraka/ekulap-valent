<?php

namespace App\Http\Controllers;

use App\Enums\HarvestType;
use App\Enums\RecordStatus;
use App\Enums\TransportStatus;
use App\Http\Requests\Ekulap\StoreTphHarvestRequest;
use App\Models\Block;
use App\Models\Division;
use App\Models\TphHarvestRecord;
use App\Models\TphPoint;
use App\Models\User;
use App\Models\Worker;
use App\Services\HarvestLoadingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class TphHarvestController extends Controller
{
    public function __construct(
        private readonly HarvestLoadingService $loadingService,
    ) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));
        $divisionId = $request->integer('division_id') ?: null;

        $records = TphHarvestRecord::query()
            ->with(['division', 'block', 'tphPoint', 'worker', 'workers', 'recorder', 'weigher'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($sub) use ($search): void {
                    $sub->where('lot_number', 'like', "%{$search}%")
                        ->orWhereHas('worker', fn ($w) => $w->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('workers', fn ($w) => $w->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('tphPoint', fn ($t) => $t->where('code', 'like', "%{$search}%"));
                });
            })
            ->when($status !== '', fn ($query) => $query->where('transport_status', $status))
            ->when($divisionId, fn ($query) => $query->where('division_id', $divisionId))
            ->orderByDesc('work_date')
            ->orderByDesc('weighed_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('tph-harvest/TphHarvestIndex', [
            'records' => $records,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'division_id' => $divisionId,
            ],
            'divisions' => Division::query()->orderBy('code')->get(['id', 'code', 'name']),
            'blocks' => Block::query()->orderBy('code')->get(['id', 'division_id', 'code', 'planting_year']),
            'tphPoints' => TphPoint::query()
                ->with('block:id,division_id,code')
                ->orderBy('code')
                ->get(['id', 'block_id', 'code', 'location_label', 'latitude', 'longitude']),
            'workers' => Worker::query()
                ->where('status', RecordStatus::Aktif->value)
                ->orderBy('name')
                ->get(['id', 'division_id', 'worker_code', 'name', 'job_type']),
            'weighers' => User::query()
                ->where('status', RecordStatus::Aktif->value)
                ->orderBy('name')
                ->get(['id', 'name', 'username', 'role']),
            'harvestTypes' => HarvestType::values(),
            'transportStatuses' => [
                TransportStatus::BelumDiangkut->value,
                TransportStatus::DiangkutSebagian->value,
                TransportStatus::SudahDiangkut->value,
            ],
        ]);
    }

    public function store(StoreTphHarvestRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validated();

        $photoPaths = [];
        /** @var list<UploadedFile> $uploadedFiles */
        $uploadedFiles = $request->file('photos', []);
        foreach ($uploadedFiles as $file) {
            $storedPath = $file->store('harvest-photos', 'public');
            if ($storedPath !== false) {
                $photoPaths[] = $storedPath;
            }
        }
        $validated['photo_paths'] = $photoPaths;

        $record = $this->loadingService->createHarvestRecord($validated, $user);

        return redirect()
            ->route('tph-harvest.index')
            ->with('success', "Catatan hasil panen {$record->lot_number} ({$record->sack_count} Karung / {$record->net_weight_kg} Kg) berhasil disimpan.");
    }

    public function destroy(TphHarvestRecord $tphHarvest): RedirectResponse
    {
        if ($tphHarvest->loaded_sack_count > 0) {
            return redirect()
                ->back()
                ->with('error', "Lot {$tphHarvest->lot_number} sudah dimuat ke Surat Jalan dan tidak dapat dihapus.");
        }

        $lot = $tphHarvest->lot_number;
        $tphHarvest->delete();

        return redirect()
            ->route('tph-harvest.index')
            ->with('success', "Catatan lot {$lot} berhasil dihapus.");
    }
}
