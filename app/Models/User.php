<?php

namespace App\Models;

use App\Enums\RecordStatus;
use App\Enums\UserRole;
use App\Services\RbacCatalog;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string|null $username
 * @property string|null $phone
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string $role
 * @property int|null $division_id
 * @property RecordStatus $status
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'username', 'phone', 'email', 'password', 'role', 'division_id', 'status', 'email_verified_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected string $guard_name = RbacCatalog::GUARD;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => 'string',
            'status' => RecordStatus::class,
        ];
    }

    /**
     * @return BelongsTo<Division, $this>
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    /**
     * @return HasMany<TphHarvestRecord, $this>
     */
    public function recordedHarvests(): HasMany
    {
        return $this->hasMany(TphHarvestRecord::class, 'recorder_user_id');
    }

    /**
     * @return HasMany<DeliveryOrder, $this>
     */
    public function loadedDeliveries(): HasMany
    {
        return $this->hasMany(DeliveryOrder::class, 'loader_user_id');
    }

    public function isActive(): bool
    {
        return $this->status === RecordStatus::Aktif;
    }

    public function roleLabel(): string
    {
        return trim($this->role) !== '' ? $this->role : 'Pengguna';
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin->value
            || $this->hasRole(UserRole::Admin->value);
    }

    /**
     * @return list<string>
     */
    public function resolvedPermissionNames(): array
    {
        if ($this->isAdmin()) {
            return app(RbacCatalog::class)->allPermissionNames();
        }

        return array_values(
            $this->getAllPermissions()
                ->pluck('name')
                ->filter(static fn (mixed $name): bool => is_string($name) && $name !== '')
                ->unique()
                ->all(),
        );
    }
}
