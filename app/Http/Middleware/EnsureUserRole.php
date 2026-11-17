<?php

namespace App\Http\Middleware;

use App\Enums\RecordStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->status === RecordStatus::Nonaktif) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda berstatus Nonaktif.',
            ]);
        }

        if ($roles !== [] && ! in_array($user->role->value, $roles, true)) {
            abort(403, 'Jabatan Anda tidak memiliki izin untuk mengakses fitur ini.');
        }

        return $next($request);
    }
}
