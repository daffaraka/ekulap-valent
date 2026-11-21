<?php

namespace App\Services;

use App\Ai\Agents\EkulapAnalystAgent;
use App\Ai\Tools\GetGpsDeviationAuditTool;
use App\Ai\Tools\GetHarvestBacklogTool;
use App\Ai\Tools\GetShrinkageAuditTool;
use App\Ai\Tools\GetWorkerProductionTool;
use Laravel\Ai\Tools\Request as ToolRequest;
use Throwable;

class AiInsightService
{
    public function __construct(
        private readonly GetHarvestBacklogTool $backlogTool,
        private readonly GetShrinkageAuditTool $shrinkageTool,
        private readonly GetGpsDeviationAuditTool $gpsTool,
        private readonly GetWorkerProductionTool $workerTool,
    ) {}

    /**
     * @return array{
     *   provider_configured: bool,
     *   active_provider: string|null,
     *   backlog: array<string, mixed>,
     *   shrinkage: array<string, mixed>,
     *   gps_audit: array<string, mixed>,
     *   workers: array<string, mixed>,
     *   alerts: list<array{severity: string, title: string, detail: string}>
     * }
     */
    public function getOperationalSnapshot(?int $divisionId = null): array
    {
        $divisionFilter = $divisionId !== null && $divisionId > 0 ? ['division_id' => $divisionId] : [];

        $backlog = $this->decodeToolOutput($this->backlogTool->handle(new ToolRequest($divisionFilter)));
        $shrinkage = $this->decodeToolOutput($this->shrinkageTool->handle(new ToolRequest($divisionFilter)));
        $gpsAudit = $this->decodeToolOutput($this->gpsTool->handle(new ToolRequest($divisionFilter)));
        $workers = $this->decodeToolOutput($this->workerTool->handle(new ToolRequest(['limit' => 5, ...$divisionFilter])));

        $alerts = [];

        if (($backlog['total_remaining_sacks'] ?? 0) > 0) {
            $alerts[] = [
                'severity' => 'warning',
                'title' => "{$backlog['total_remaining_sacks']} Karung Belum Diangkut ({$backlog['total_remaining_kg']} Kg)",
                'detail' => "Terdapat {$backlog['pending_lot_count']} stasiun di TPH yang menunggu muat Surat Jalan (SPB).",
            ];
        }

        if (($shrinkage['anomaly_count'] ?? 0) > 0) {
            $alerts[] = [
                'severity' => 'danger',
                'title' => "{$shrinkage['anomaly_count']} Pengiriman SPB Mengalami Susut Tinggi (>2%)",
                'detail' => "Total selisih susut PKS tercatat {$shrinkage['total_shrinkage_kg']} Kg (rata-rata {$shrinkage['average_shrinkage_percent']}%).",
            ];
        }

        if (($gpsAudit['flagged_count'] ?? 0) > 0) {
            $alerts[] = [
                'severity' => 'warning',
                'title' => "{$gpsAudit['flagged_count']} Catatan Timbang Terdeteksi Deviasi GPS > {$gpsAudit['max_tolerance_meters']}m",
                'detail' => 'Periksa keakuratan posisi pencatatan Kerani terhadap titik koordinat paten TPH.',
            ];
        }

        $activeProvider = $this->resolveConfiguredProvider();

        return [
            'provider_configured' => $activeProvider !== null,
            'active_provider' => $activeProvider,
            'backlog' => $backlog,
            'shrinkage' => $shrinkage,
            'gps_audit' => $gpsAudit,
            'workers' => $workers,
            'alerts' => $alerts,
        ];
    }

    /**
     * @return array{
     *   answer: string,
     *   mode: string,
     *   provider: string,
     *   used_tools: list<string>,
     *   snapshot: array<string, mixed>
     * }
     */
    public function ask(string $question): array
    {
        $snapshot = $this->getOperationalSnapshot();
        $provider = $this->resolveConfiguredProvider();

        if (EkulapAnalystAgent::isFaked() || $provider !== null) {
            try {
                $response = EkulapAnalystAgent::make()->prompt(
                    $question,
                    provider: $provider,
                );

                return [
                    'answer' => $response->text,
                    'mode' => 'laravel_ai_sdk',
                    'provider' => $provider ?? 'laravel_ai_fake',
                    'used_tools' => [
                        'GetHarvestBacklogTool',
                        'GetShrinkageAuditTool',
                        'GetGpsDeviationAuditTool',
                        'GetWorkerProductionTool',
                    ],
                    'snapshot' => $snapshot,
                ];
            } catch (Throwable) {
                // Fall back seamlessly to local deterministic tool analytics if remote LLM is unreachable.
            }
        }

        return [
            'answer' => $this->buildDeterministicAnalysis($question, $snapshot),
            'mode' => 'local_tool_engine',
            'provider' => 'eKULAP Local AI Engine (laravel/ai Tools)',
            'used_tools' => [
                'GetHarvestBacklogTool',
                'GetShrinkageAuditTool',
                'GetGpsDeviationAuditTool',
                'GetWorkerProductionTool',
            ],
            'snapshot' => $snapshot,
        ];
    }

    private function resolveConfiguredProvider(): ?string
    {
        $candidates = [
            'gemini' => config('ai.providers.gemini.key'),
            'openai' => config('ai.providers.openai.key'),
            'anthropic' => config('ai.providers.anthropic.key'),
            'groq' => config('ai.providers.groq.key'),
            'deepseek' => config('ai.providers.deepseek.key'),
            'openrouter' => config('ai.providers.openrouter.key'),
        ];

        $default = (string) config('ai.default', 'gemini');
        if (isset($candidates[$default]) && filled($candidates[$default])) {
            return $default;
        }

        foreach ($candidates as $name => $key) {
            if (filled($key)) {
                return $name;
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeToolOutput(string $json): array
    {
        $decoded = json_decode($json, true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @param  array<string, mixed>  $snapshot
     */
    private function buildDeterministicAnalysis(string $question, array $snapshot): string
    {
        $lower = mb_strtolower($question);
        $sections = [];

        $includeAll = ! str_contains($lower, 'susut')
            && ! str_contains($lower, 'pks')
            && ! str_contains($lower, 'gps')
            && ! str_contains($lower, 'pemanen')
            && ! str_contains($lower, 'pekerja')
            && ! str_contains($lower, 'karung')
            && ! str_contains($lower, 'belum diangkut')
            && ! str_contains($lower, 'restan');

        if ($includeAll || str_contains($lower, 'karung') || str_contains($lower, 'belum diangkut') || str_contains($lower, 'restan') || str_contains($lower, 'tph')) {
            $backlog = $snapshot['backlog'];
            $lots = $backlog['lots'] ?? [];
            $lotLines = array_map(
                fn (array $lot): string => "- {$lot['lot_number']} ({$lot['tph_code']} • {$lot['worker']}): {$lot['remaining_sacks']}/{$lot['total_sacks']} karung sisa ({$lot['remaining_kg']} Kg) — Status: {$lot['status']}",
                array_slice($lots, 0, 5),
            );
            $sections[] = "**1. Status Antrean Karung di TPH (Belum / Sebagian Diangkut)**\n"
                ."Total {$backlog['pending_lot_count']} stasiun masih memiliki sisa {$backlog['total_remaining_sacks']} karung ({$backlog['total_remaining_kg']} Kg).\n"
                .($lotLines !== [] ? implode("\n", $lotLines) : '- Seluruh hasil timbang TPH sudah terangkut ke truk/PKS.');
        }

        if ($includeAll || str_contains($lower, 'susut') || str_contains($lower, 'pks') || str_contains($lower, 'timbang')) {
            $shrinkage = $snapshot['shrinkage'];
            $records = $shrinkage['records'] ?? [];
            $spbLines = array_map(
                fn (array $row): string => "- {$row['spb_number']} ({$row['plate_number']} → {$row['pks_mill']}): Kebun {$row['estimated_kg']} Kg vs PKS {$row['pks_net_weight_kg']} Kg | Susut {$row['shrinkage_kg']} Kg ({$row['shrinkage_percent']}%)"
                    .($row['is_anomaly'] ? ' [ANOMALI >2%]' : ' [Normal]'),
                array_slice($records, 0, 5),
            );
            $sections[] = "**2. Rekonsiliasi & Audit Susut Timbangan PKS**\n"
                ."Dari {$shrinkage['spb_count']} SPB diterima PKS: Estimasi Kebun {$shrinkage['total_estimated_kg']} Kg vs Netto PKS {$shrinkage['total_pks_kg']} Kg (Total Susut {$shrinkage['total_shrinkage_kg']} Kg / {$shrinkage['average_shrinkage_percent']}%).\n"
                .($spbLines !== [] ? implode("\n", $spbLines) : '- Belum ada SPB dengan tiket timbang PKS.');
        }

        if ($includeAll || str_contains($lower, 'gps') || str_contains($lower, 'koordinat') || str_contains($lower, 'lokasi')) {
            $gps = $snapshot['gps_audit'];
            $flagged = $gps['flagged_records'] ?? [];
            $gpsLines = array_map(
                fn (array $row): string => "- {$row['lot_number']} di {$row['tph_code']} ({$row['recorder']}): deviasi {$row['gps_distance_meters']} meter",
                array_slice($flagged, 0, 5),
            );
            $sections[] = "**3. Validasi Jarak GPS vs Master Titik TPH**\n"
                ."Batas toleransi: {$gps['max_tolerance_meters']} meter. Terdeteksi {$gps['flagged_count']} catatan menyimpang.\n"
                .($gpsLines !== [] ? implode("\n", $gpsLines) : '- Seluruh pencatatan berada dalam radius aman master titik TPH.');
        }

        if ($includeAll || str_contains($lower, 'pemanen') || str_contains($lower, 'pekerja') || str_contains($lower, 'kutip')) {
            $workers = $snapshot['workers'];
            $ranking = array_values($workers['ranking'] ?? []);
            $workerLines = [];
            foreach ($ranking as $idx => $row) {
                $workerLines[] = ($idx + 1).". {$row['name']} ({$row['worker_code']} • {$row['job_type']}): {$row['total_sacks']} karung / {$row['total_net_kg']} Kg";
            }
            $sections[] = "**4. Produktivitas Pemanen & Kutip Lapis Teratas**\n"
                .($workerLines !== [] ? implode("\n", $workerLines) : '- Belum ada data produksi pekerja.');
        }

        return implode("\n\n", $sections);
    }
}
