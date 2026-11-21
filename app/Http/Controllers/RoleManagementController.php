<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\Ekulap\StoreRoleRequest;
use App\Http\Requests\Ekulap\UpdateRolePermissionsRequest;
use App\Models\User;
use App\Services\AuditLoggerService;
use App\Services\RbacCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleManagementController extends Controller
{
    public function __construct(
        private readonly RbacCatalog $rbacCatalog,
        private readonly AuditLoggerService $auditLogger,
    ) {}

    public function index(): Response
    {
        $allPermissions = $this->rbacCatalog->allPermissionNames();
        $userCountsByRole = User::query()
            ->select(['role', DB::raw('COUNT(*) as total')])
            ->groupBy('role')
            ->pluck('total', 'role')
            ->map(static fn (mixed $count): int => (int) $count)
            ->all();

        $roles = Role::query()
            ->where('guard_name', RbacCatalog::GUARD)
            ->with('permissions:id,name')
            ->orderBy('id')
            ->get()
            ->map(function (Role $role) use ($allPermissions, $userCountsByRole): array {
                $isAdmin = $role->name === UserRole::Admin->value;
                $permissions = $isAdmin
                    ? $allPermissions
                    : $role->permissions->pluck('name')->values()->all();

                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'is_system' => $this->rbacCatalog->isSystemRole($role->name),
                    'is_admin' => $isAdmin,
                    'users_count' => $userCountsByRole[$role->name] ?? 0,
                    'permissions' => $permissions,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('roles/RolesIndex', [
            'roles' => $roles,
            'permissionGroups' => $this->rbacCatalog->permissionGroups(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $roleName = trim((string) $validated['name']);

        /** @var Role $role */
        $role = Role::create([
            'name' => $roleName,
            'guard_name' => RbacCatalog::GUARD,
        ]);

        /** @var list<string> $permissions */
        $permissions = [];
        if (! empty($validated['template_role'])) {
            $template = Role::query()
                ->where('name', (string) $validated['template_role'])
                ->where('guard_name', RbacCatalog::GUARD)
                ->with('permissions:id,name')
                ->first();
            if ($template instanceof Role) {
                $permissions = $template->permissions->pluck('name')->values()->all();
            }
        } elseif (! empty($validated['permissions']) && is_array($validated['permissions'])) {
            $permissions = array_values(array_unique(array_map('strval', $validated['permissions'])));
        }

        $role->syncPermissions($permissions);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $actor = $request->user();
        $actorName = $actor instanceof User ? $actor->name : 'Admin';
        $count = count($permissions);

        $this->auditLogger->log(
            category: 'users',
            action: 'role_created',
            humanMessage: "{$actorName} membuat role baru \"{$role->name}\" dengan {$count} hak akses.",
            severity: 'warning',
            subject: $role,
            actor: $actor instanceof User ? $actor : null,
            fallbackActorName: $actorName,
        );

        return redirect()
            ->route('roles.index')
            ->with('success', "Role \"{$role->name}\" berhasil dibuat dengan {$count} izin aktif.");
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, Role $role): RedirectResponse
    {
        if ($role->name === UserRole::Admin->value) {
            return redirect()
                ->route('roles.index')
                ->with('error', 'Role Admin memiliki akses penuh sistem dan izinnya tidak dapat dibatasi.');
        }

        $validated = $request->validated();
        /** @var list<string> $permissions */
        $permissions = array_values(array_unique(array_map('strval', $validated['permissions'])));

        $role->syncPermissions($permissions);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $actor = $request->user();
        $actorName = $actor instanceof User ? $actor->name : 'Admin';
        $count = count($permissions);

        $this->auditLogger->log(
            category: 'users',
            action: 'role_permissions_updated',
            humanMessage: "{$actorName} memperbarui matriks hak akses role \"{$role->name}\" ({$count} izin aktif).",
            severity: 'warning',
            subject: $role,
            actor: $actor instanceof User ? $actor : null,
            fallbackActorName: $actorName,
        );

        return redirect()
            ->route('roles.index')
            ->with('success', "Hak akses role \"{$role->name}\" berhasil diperbarui ({$count} izin aktif).");
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($this->rbacCatalog->isSystemRole($role->name)) {
            return redirect()
                ->route('roles.index')
                ->with('error', "Role sistem bawaan \"{$role->name}\" tidak dapat dihapus.");
        }

        $assignedUsersCount = User::query()->where('role', $role->name)->count();
        if ($assignedUsersCount > 0) {
            return redirect()
                ->route('roles.index')
                ->with('error', "Role \"{$role->name}\" masih digunakan oleh {$assignedUsersCount} pengguna. Pindahkan pengguna terlebih dahulu.");
        }

        $roleName = $role->name;
        $role->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $actor = request()->user();
        $actorName = $actor instanceof User ? $actor->name : 'Admin';

        $this->auditLogger->log(
            category: 'users',
            action: 'role_deleted',
            humanMessage: "{$actorName} menghapus role kustom \"{$roleName}\".",
            severity: 'warning',
            actor: $actor instanceof User ? $actor : null,
            fallbackActorName: $actorName,
        );

        return redirect()
            ->route('roles.index')
            ->with('success', "Role \"{$roleName}\" berhasil dihapus.");
    }
}
