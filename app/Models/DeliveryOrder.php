<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $spb_number
 * @property int $division_id
 * @property int $truck_id
 * @property int $pks_mill_id
 * @property string|null $notes
 * @property int $loader_user_id
 * @property int $total_sacks_loaded
 * @property float $total_estimated_kg
 * @property list<string>|null $loading_photo_paths
 * @property Carbon|null $departed_at
 * @property string|null $pks_ticket_number
 * @property float|null $pks_net_weight_kg
 * @property float|null $weight_shrinkage_kg
 * @property string|null $pks_slip_photo_path
 * @property Carbon|null $arrived_at
 * @property DeliveryStatus $delivery_status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'spb_number',
    'division_id',
    'truck_id',
    'pks_mill_id',
    'notes',
    'loader_user_id',
    'total_sacks_loaded',
    'total_estimated_kg',
    'loading_photo_paths',
    'departed_at',
    'pks_ticket_number',
    'pks_net_weight_kg',
    'weight_shrinkage_kg',
    'pks_slip_photo_path',
    'arrived_at',
    'delivery_status',
])]
class DeliveryOrder extends Model
{
    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'delivery_status' => DeliveryStatus::BelumMuat->value,
    ];

    protected function casts(): array
    {
        return [
            'total_sacks_loaded' => 'integer',
            'total_estimated_kg' => 'float',
            'loading_photo_paths' => 'array',
            'departed_at' => 'datetime',
            'pks_net_weight_kg' => 'float',
            'weight_shrinkage_kg' => 'float',
            'arrived_at' => 'datetime',
            'delivery_status' => DeliveryStatus::class,
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
     * @return BelongsTo<Truck, $this>
     */
    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class);
    }

    /**
     * @return BelongsTo<PksMill, $this>
     */
    public function pksMill(): BelongsTo
    {
        return $this->belongsTo(PksMill::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function loader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'loader_user_id');
    }

    /**
     * @return HasMany<DeliveryOrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(DeliveryOrderItem::class);
    }
}
