<?php

namespace App\Http\Middleware;

use App\Enums\TransportStatus;
use App\Models\TphHarvestRecord;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user()?->loadMissing('division');

        $pendingTphLots = $user
            ? TphHarvestRecord::query()
                ->whereIn('transport_status', [
                    TransportStatus::BelumDiangkut->value,
                    TransportStatus::DiangkutSebagian->value,
                ])
                ->count()
            : 0;

        return [
            ...parent::share($request),
            'name' => config('app.name', 'eKULAP'),
            'isDevelopment' => app()->environment(['local', 'development']),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'pendingTphLots' => $pendingTphLots,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
