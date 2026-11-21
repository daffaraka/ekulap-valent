<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Enums\RecordStatus;
use App\Models\User;
use App\Services\RbacCatalog;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponseContract::class, function () {
            return new class implements LoginResponseContract
            {
                public function toResponse($request)
                {
                    /** @var User|null $user */
                    $user = $request->user();

                    if ($user instanceof User) {
                        $homeRoute = app(RbacCatalog::class)->homeRouteFor($user);
                        if ($homeRoute !== 'dashboard') {
                            return redirect()->route($homeRoute);
                        }
                    }

                    return redirect()->intended(route('dashboard', absolute: false));
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        Fortify::authenticateUsing(function (Request $request): ?User {
            $identifier = trim((string) $request->input(Fortify::username()));
            $password = (string) $request->input('password');

            $user = User::query()
                ->where('username', $identifier)
                ->first();

            if (! $user || ! Hash::check($password, $user->password)) {
                return null;
            }

            if ($user->status === RecordStatus::Nonaktif) {
                throw ValidationException::withMessages([
                    Fortify::username() => 'Akun ini berstatus Nonaktif. Hubungi Admin kebun untuk aktivasi.',
                ]);
            }

            return $user;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/AuthLogin', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
            'demoAccounts' => app()->environment('local', 'testing') ? [
                ['label' => 'Admin', 'username' => '10010001', 'name' => 'Erik Harahap'],
                ['label' => 'Pimpinan (EM/RC)', 'username' => '10010002', 'name' => 'Valent'],
                ['label' => 'Kerani Produksi', 'username' => '10010003', 'name' => 'Rizky Pratama'],
                ['label' => 'Supervisi/Asisten', 'username' => '10010004', 'name' => 'Andi Wijaya'],
                ['label' => 'Supir', 'username' => '10010005', 'name' => 'Budi Hartono'],
                ['label' => 'Checker PKS', 'username' => '10010006', 'name' => 'Hendra Gunawan'],
            ] : [],
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('passkeys', function (Request $request) {
            return Limit::perMinute(10)->by(
                ($request->input('credential.id') ?: $request->session()->getId()).'|'.$request->ip(),
            );
        });
    }
}
