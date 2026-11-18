<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Services\SystemHealthLogService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SystemMonitorController extends Controller
{
    /** @var array<string, string> */
    private const CATEGORY_LABELS = [
        'auth' => 'Login & Keamanan',
        'upload' => 'Upload Foto',
        'harvest' => 'Timbang TPH',
        'spb' => 'Surat Jalan (SPB)',
        'pks' => 'Timbangan PKS',
        'master' => 'Master Data',
        'users' => 'Manajemen Pengguna',
    ];

    public function __construct(
        private readonly SystemHealthLogService $healthLogService,
    ) {}

    public function index(Request $request): Response
    {
        $category = trim((string) $request->string('category'));
        $severity = trim((string) $request->string('severity'));
        $search = trim((string) $request->string('search'));
        $dateFrom = trim((string) $request->string('date_from'));
        $dateTo = trim((string) $request->string('date_to'));

        $incidents = $this->healthLogService->parseRecentIncidents();
        $overview = $this->healthLogService->buildOverview($incidents);

        $defaultTab = ($overview['errors_24h'] > 0 || $overview['upload_failures_24h'] > 0)
            ? 'incidents'
            : 'audit';
        $activeTab = trim((string) $request->string('tab', $defaultTab));
        if (! in_array($activeTab, ['incidents', 'audit'], true)) {
            $activeTab = 'audit';
        }

        $auditLogs = $this->buildAuditQuery($category, $severity, $search, $dateFrom, $dateTo)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('system-monitor/SystemMonitorIndex', [
            'overview' => $overview,
            'incidents' => $incidents,
            'auditLogs' => $auditLogs,
            'filters' => [
                'tab' => $activeTab,
                'category' => $category,
                'severity' => $severity,
                'search' => $search,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'categoryOptions' => collect(self::CATEGORY_LABELS)
                ->map(fn (string $label, string $value): array => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $category = trim((string) $request->string('category'));
        $severity = trim((string) $request->string('severity'));
        $search = trim((string) $request->string('search'));
        $dateFrom = trim((string) $request->string('date_from'));
        $dateTo = trim((string) $request->string('date_to'));

        $rows = $this->buildAuditQuery($category, $severity, $search, $dateFrom, $dateTo)
            ->limit(2000)
            ->get();

        return response()->streamDownload(function () use ($rows): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'Waktu (WIB)',
                'Kategori',
                'Tingkat',
                'Pelaku',
                'NIK / Username',
                'Peran',
                'Penjelasan Kejadian',
                'Alamat IP',
            ]);

            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->created_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                    self::CATEGORY_LABELS[$row->category] ?? $row->category,
                    match ($row->severity) {
                        'danger' => 'Bahaya / Kritis',
                        'warning' => 'Perlu Perhatian',
                        default => 'Normal',
                    },
                    $row->actor_name,
                    $row->actor_username ?? '-',
                    $row->actor_role ?? '-',
                    $row->human_message,
                    $row->ip_address ?? '-',
                ]);
            }

            fclose($handle);
        }, 'audit-keamanan-sistem-ekulap.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return Builder<AuditLog>
     */
    private function buildAuditQuery(
        string $category,
        string $severity,
        string $search,
        string $dateFrom,
        string $dateTo,
    ): Builder {
        return AuditLog::query()
            ->when($category !== '', fn ($q) => $q->where('category', $category))
            ->when($severity !== '', fn ($q) => $q->where('severity', $severity))
            ->when($dateFrom !== '', fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($sub) use ($search): void {
                    $sub->where('actor_name', 'like', "%{$search}%")
                        ->orWhere('actor_username', 'like', "%{$search}%")
                        ->orWhere('human_message', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }
}
