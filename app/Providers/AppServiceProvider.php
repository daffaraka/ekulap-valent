<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\AuditLoggerService;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureProxyScheme();
        $this->configureAuditAuthListeners();
    }

    protected function configureAuditAuthListeners(): void
    {
        Event::listen(Login::class, function (Login $event): void {
            if (! $event->user instanceof User) {
                return;
            }

            $user = $event->user;
            $roleAttr = $user->getAttribute('role');
            $roleLabel = $roleAttr instanceof UserRole ? $roleAttr->value : 'Pengguna';
            $nik = $user->username ?? $user->email;

            app(AuditLoggerService::class)->log(
                category: 'auth',
                action: 'login_success',
                humanMessage: "{$user->name} ({$roleLabel} · NIK {$nik}) berhasil masuk ke aplikasi.",
                severity: 'normal',
                subject: $user,
                actor: $user,
            );
        });

        Event::listen(Failed::class, function (Failed $event): void {
            $audit = app(AuditLoggerService::class);
            $matchedUser = $event->user instanceof User ? $event->user : null;
            $rawUsername = trim((string) ($event->credentials['username'] ?? $event->credentials['email'] ?? ''));
            $username = $matchedUser !== null ? $matchedUser->username : ($rawUsername !== '' ? $rawUsername : null);
            $ipAddress = app()->bound('request') ? request()->ip() : null;

            $recentFailures = $audit->recentFailedLogins($username, $ipAddress) + 1;
            $severity = $recentFailures >= 3 ? 'danger' : 'warning';
            $targetLabel = $matchedUser !== null
                ? "akun {$matchedUser->name} (NIK {$matchedUser->username})"
                : 'NIK "'.($username ?? '-').'" (tidak terdaftar)';

            $suffix = $recentFailures >= 3
                ? " — terdeteksi {$recentFailures}x percobaan gagal dalam 15 menit terakhir!"
                : '.';

            $audit->log(
                category: 'auth',
                action: 'login_failed',
                humanMessage: "Percobaan login gagal untuk {$targetLabel} karena kata sandi salah atau tidak sesuai{$suffix}",
                severity: $severity,
                subject: $matchedUser,
                actor: $matchedUser,
                fallbackActorName: $matchedUser !== null ? $matchedUser->name : 'Percobaan Login Gagal',
                fallbackUsername: $username,
            );
        });

        Event::listen(Logout::class, function (Logout $event): void {
            if (! $event->user instanceof User) {
                return;
            }

            $user = $event->user;
            $roleAttr = $user->getAttribute('role');
            $roleLabel = $roleAttr instanceof UserRole ? $roleAttr->value : 'Pengguna';

            app(AuditLoggerService::class)->log(
                category: 'auth',
                action: 'logout',
                humanMessage: "{$user->name} ({$roleLabel}) keluar dari aplikasi.",
                severity: 'normal',
                subject: $user,
                actor: $user,
            );
        });

        Event::listen(Lockout::class, function (Lockout $event): void {
            $nik = trim((string) $event->request->input('email', ''));
            app(AuditLoggerService::class)->log(
                category: 'auth',
                action: 'lockout',
                humanMessage: 'Akses login dibatasi sementara karena terlalu banyak percobaan sandi salah untuk NIK "'.($nik !== '' ? $nik : '-').'".',
                severity: 'danger',
                fallbackActorName: 'Proteksi Login',
                fallbackUsername: $nik !== '' ? $nik : null,
            );
        });
    }

    protected function configureProxyScheme(): void
    {
        if (app()->runningInConsole()) {
            return;
        }

        $forwardedProto = request()->header('X-Forwarded-Proto');
        $appUrl = (string) config('app.url');

        if ($forwardedProto === 'https' || str_starts_with($appUrl, 'https://')) {
            URL::forceScheme('https');
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
