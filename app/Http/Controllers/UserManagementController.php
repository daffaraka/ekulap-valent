<?php

namespace App\Http\Controllers;

use App\Enums\RecordStatus;
use App\Enums\UserRole;
use App\Http\Requests\Ekulap\StoreUserRequest;
use App\Models\Division;
use App\Models\User;
use App\Services\AuditLoggerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function __construct(
        private readonly AuditLoggerService $auditLogger,
    ) {}

    public function index(): Response
    {
        return Inertia::render('users/UsersIndex', [
            'users' => User::query()->with('division:id,code,name')->orderBy('id')->get(),
            'divisions' => Division::query()->orderBy('code')->get(['id', 'code', 'name']),
            'roles' => UserRole::values(),
            'statuses' => RecordStatus::values(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $email = ! empty($validated['email'])
            ? $validated['email']
            : "{$validated['username']}@ekulap.local";

        $createdUser = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'phone' => $validated['phone'] ?? null,
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Hash::make((string) $validated['password']),
            'role' => $validated['role'],
            'division_id' => ! empty($validated['division_id']) ? $validated['division_id'] : null,
            'status' => $validated['status'],
        ]);

        $actor = $request->user();
        $actorName = $actor instanceof User ? $actor->name : 'Admin';
        $this->auditLogger->log(
            category: 'users',
            action: 'created',
            humanMessage: "{$actorName} menambahkan akun pengguna baru: {$createdUser->name} (NIK {$createdUser->username} · peran {$createdUser->role->value}).",
            severity: 'warning',
            subject: $createdUser,
            actor: $actor instanceof User ? $actor : null,
            fallbackActorName: $actorName,
        );

        return redirect()->route('users.index')
            ->with('success', "Pengguna {$validated['name']} berhasil dibuat.");
    }

    public function update(StoreUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        $payload = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'division_id' => ! empty($validated['division_id']) ? $validated['division_id'] : null,
            'status' => $validated['status'],
        ];

        if (! empty($validated['email'])) {
            $payload['email'] = $validated['email'];
        }

        if (! empty($validated['password'])) {
            $payload['password'] = Hash::make((string) $validated['password']);
        }

        $user->update($payload);

        $actor = $request->user();
        $actorName = $actor instanceof User ? $actor->name : 'Admin';
        $this->auditLogger->log(
            category: 'users',
            action: 'updated',
            humanMessage: "{$actorName} memperbarui data/hak akses pengguna {$user->name} (NIK {$user->username} · peran {$user->role->value} · status {$user->status->value}).",
            severity: 'warning',
            subject: $user,
            actor: $actor instanceof User ? $actor : null,
            fallbackActorName: $actorName,
        );

        return redirect()->route('users.index')
            ->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    public function toggleStatus(User $user): RedirectResponse
    {
        $user->update([
            'status' => $user->status === RecordStatus::Aktif
                ? RecordStatus::Nonaktif
                : RecordStatus::Aktif,
        ]);

        $actor = request()->user();
        $actorName = $actor instanceof User ? $actor->name : 'Admin';
        $this->auditLogger->log(
            category: 'users',
            action: 'toggled',
            humanMessage: "{$actorName} mengubah status akun {$user->name} (NIK {$user->username}) menjadi {$user->status->value}.",
            severity: 'warning',
            subject: $user,
            actor: $actor instanceof User ? $actor : null,
            fallbackActorName: $actorName,
        );

        return redirect()->route('users.index')
            ->with('success', "Status akun {$user->name} diubah menjadi {$user->status->value}.");
    }
}
