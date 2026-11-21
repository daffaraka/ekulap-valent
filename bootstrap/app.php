<?php

use App\Http\Middleware\ConfigureProxyVite;
use App\Http\Middleware\EnsureUserRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Services\AuditLoggerService;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'active' => EnsureUserRole::class,
            'role' => EnsureUserRole::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);

        $middleware->web(
            prepend: [
                ConfigureProxyVite::class,
            ],
            append: [
                HandleAppearance::class,
                HandleInertiaRequests::class,
                AddLinkHeadersForPreloadedAssets::class,
            ],
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->stopIgnoring(PostTooLargeException::class);

        $exceptions->report(function (PostTooLargeException $exception): void {
            $request = app()->bound('request') ? request() : null;
            $sizeMb = $request instanceof Request
                ? round(((int) $request->server('CONTENT_LENGTH', 0)) / 1048576, 1)
                : 0.0;
            $sizeText = $sizeMb > 0 ? " ({$sizeMb} MB)" : '';

            app(AuditLoggerService::class)->log(
                category: 'upload',
                action: 'upload_too_large',
                humanMessage: "Gagal mengunggah foto/data{$sizeText} karena ukuran kiriman melebihi batas maksimal server (HTTP 413).",
                severity: 'danger',
            );
        });

        $exceptions->render(function (PostTooLargeException $exception, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Total ukuran foto melebihi batas server. Kirim foto dengan ukuran lebih kecil atau bertahap.',
                ], 413);
            }

            return redirect()
                ->back()
                ->with('error', 'Total ukuran foto yang dikirim melebihi batas maksimal server. Kurangi jumlah foto per pengiriman atau gunakan foto dengan ukuran lebih kecil.');
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
