<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Throwable;

class AuditLoggerService
{
    public function log(
        string $category,
        string $action,
        string $humanMessage,
        string $severity = 'normal',
        ?Model $subject = null,
        ?User $actor = null,
        ?string $fallbackActorName = null,
        ?string $fallbackUsername = null,
    ): void {
        try {
            $request = app()->bound('request') ? request() : null;
            $resolvedActor = $actor ?? ($request instanceof Request ? $request->user() : null);

            $actorName = $resolvedActor instanceof User
                ? $resolvedActor->name
                : ($fallbackActorName ?? 'Sistem / Tamu');

            $actorUsername = $resolvedActor instanceof User
                ? $resolvedActor->username
                : $fallbackUsername;

            $actorRoleAttr = $resolvedActor instanceof User
                ? $resolvedActor->getAttribute('role')
                : null;
            $actorRole = $actorRoleAttr instanceof UserRole
                ? $actorRoleAttr->value
                : null;

            $ipAddress = $request instanceof Request ? $request->ip() : null;
            $userAgent = $request instanceof Request
                ? mb_substr((string) $request->userAgent(), 0, 250)
                : null;

            $subjectKey = $subject?->getKey();

            AuditLog::query()->create([
                'user_id' => $resolvedActor instanceof User ? $resolvedActor->id : null,
                'actor_name' => mb_substr($actorName, 0, 120),
                'actor_username' => $actorUsername !== null ? mb_substr($actorUsername, 0, 60) : null,
                'actor_role' => $actorRole,
                'category' => $category,
                'action' => $action,
                'severity' => $severity,
                'human_message' => $humanMessage,
                'subject_type' => $subject !== null ? class_basename($subject) : null,
                'subject_id' => is_numeric($subjectKey) ? (int) $subjectKey : null,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent !== '' ? $userAgent : null,
                'created_at' => now(),
            ]);
        } catch (Throwable) {
            // Pencatatan audit tidak boleh mengganggu alur operasional utama.
        }
    }

    public function recentFailedLogins(?string $username, ?string $ipAddress, int $minutes = 15): int
    {
        try {
            $since = now()->subMinutes($minutes);

            return AuditLog::query()
                ->where('category', 'auth')
                ->where('action', 'login_failed')
                ->where('created_at', '>=', $since)
                ->where(function ($query) use ($username, $ipAddress): void {
                    if ($username !== null && $username !== '') {
                        $query->where('actor_username', $username);
                    }
                    if ($ipAddress !== null && $ipAddress !== '') {
                        $query->orWhere('ip_address', $ipAddress);
                    }
                })
                ->count();
        } catch (Throwable) {
            return 0;
        }
    }
}
