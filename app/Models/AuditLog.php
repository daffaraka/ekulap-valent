<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $actor_name
 * @property string|null $actor_username
 * @property string|null $actor_role
 * @property string $category
 * @property string $action
 * @property string $severity
 * @property string $human_message
 * @property string|null $subject_type
 * @property int|null $subject_id
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property CarbonImmutable $created_at
 * @property-read User|null $user
 */
class AuditLog extends Model
{
    public $timestamps = false;

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'actor_name',
        'actor_username',
        'actor_role',
        'category',
        'action',
        'severity',
        'human_message',
        'subject_type',
        'subject_id',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'immutable_datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
