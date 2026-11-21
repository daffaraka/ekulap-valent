<?php

namespace App\Ai\Agents;

use App\Ai\Tools\GetGpsDeviationAuditTool;
use App\Ai\Tools\GetHarvestBacklogTool;
use App\Ai\Tools\GetShrinkageAuditTool;
use App\Ai\Tools\GetWorkerProductionTool;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;
use Stringable;

class EkulapAnalystAgent implements Agent, HasTools
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return implode("\n", [
            'Anda adalah Asisten AI Agronomi & Logistik Sawit untuk sistem eKULAP (Sinarmas Agribusiness).',
            'Jawab pertanyaan dalam Bahasa Indonesia yang ringkas, faktual, dan berbasis angka aktual dari tools database.',
            'Gunakan tools yang tersedia untuk memeriksa restan karung di TPH, selisih susut timbangan PKS, deviasi GPS pencatatan TPH, serta produktivitas pemanen dan kutip lapis.',
            'Sebutkan nomor Stasiun (HRV-...), nomor Surat Jalan (SPB-...), kode TPH, serta rekomendasi tindak lanjut operasional jika ditemukan anomali.',
        ]);
    }

    public function tools(): iterable
    {
        return [
            new GetHarvestBacklogTool,
            new GetShrinkageAuditTool,
            new GetGpsDeviationAuditTool,
            new GetWorkerProductionTool,
        ];
    }
}
