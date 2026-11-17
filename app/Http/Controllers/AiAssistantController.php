<?php

namespace App\Http\Controllers;

use App\Services\AiInsightService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiAssistantController extends Controller
{
    public function __construct(
        private readonly AiInsightService $aiInsightService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('ai-assistant/AiAssistantWorkspace', [
            'snapshot' => $this->aiInsightService->getOperationalSnapshot(),
            'suggestedPrompts' => [
                'Berapa karung dan Kg yang masih Belum Diangkut di TPH saat ini?',
                'Audit selisih susut timbangan PKS yang melebihi batas wajar 2%',
                'Cek catatan timbang dengan deviasi GPS menjauhi titik master TPH',
                'Siapa pemanen TBS dan kutip lapis paling produktif berdasarkan total Kg?',
            ],
        ]);
    }

    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $result = $this->aiInsightService->ask((string) $validated['question']);

        return response()->json($result);
    }
}
