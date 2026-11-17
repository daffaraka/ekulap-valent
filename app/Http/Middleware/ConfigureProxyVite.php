<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class ConfigureProxyVite
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isSecure() || $request->header('X-Forwarded-Proto') === 'https') {
            URL::forceScheme('https');
        }

        $isProxiedOrExternal = $request->headers->has('X-Forwarded-Host')
            || ! in_array($request->getHost(), ['127.0.0.1', 'localhost', '::1', '[::1]'], true);

        if ($isProxiedOrExternal && is_file(public_path('build/manifest.json'))) {
            // Remote or proxied clients (e.g., ngrok) cannot load loopback Vite HMR, so fall back to built assets.
            Vite::useHotFile(storage_path('framework/vite.hot.disabled'));
        } else {
            Vite::useHotFile(public_path('hot'));
        }

        return $next($request);
    }
}
