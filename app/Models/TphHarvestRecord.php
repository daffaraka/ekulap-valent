<?php

namespace App\Models;

use App\Enums\HarvestType;
use App\Enums\TransportStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $lot_number
 * @property Carbon $work_date
 * @property int $division_id
 * @property int $block_id
 * @property int $tph_point_id
 * @property int $worker_id
 * @property int $recorder_user_id
 * @property int|null $weigher_user_id
 * @property HarvestType $harvest_type
 * @property int $sack_count
 * @property int $tph_count
 * @property int|null $bunch_count
 * @property float $gross_weight_kg
 * @property float $sack_deduction_kg
 * @property float $net_weight_kg
 * @property string|null $photo_path
 * @property list<string>|null $photo_paths
 * @property float|null $input_latitude
 * @property float|null $input_longitude
 * @property float|null $gps_distance_meters
 * @property Carbon $weighed_at
 * @property TransportStatus $transport_status
 * @property int $loaded_sack_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'lot_number',
    'work_date',
    'division_id',
    'block_id',
    'tph_point_id',
    'worker_id',
    'recorder_user_id',
    'weigher_user_id',
    'harvest_type',
    'sack_count',
    'tph_count',
    'bunch_count',
    'gross_weight_kg',
    'sack_deduction_kg',
    'net_weight_kg',
    'photo_path',
    'photo_paths',
    'input_latitude',
    'input_longitude',
    'gps_distance_meters',
    'weighed_at',
    'transport_status',
    'loaded_sack_count',
])]
class TphHarvestRecord extends Model
{
    protected function casts(): array
    {
        return [
            'work_date' => 'date',
            'harvest_type' => HarvestType::class,
            'sack_count' => 'integer',
            'tph_count' => 'integer',
            'bunch_count' => 'integer',
            'gross_weight_kg' => 'float',
            'sack_deduction_kg' => 'float',
            'net_weight_kg' => 'float',
            'photo_paths' => 'array',
            'input_latitude' => 'float',
            'input_longitude' => 'float',
            'gps_distance_meters' => 'float',
            'weighed_at' => 'datetime',
            'transport_status' => TransportStatus::class,
            'loaded_sack_count' => 'integer',
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
     * @return BelongsTo<Block, $this>
     */
    public function block(): BelongsTo
    {
        return $this->belongsTo(Block::class);
    }

    /**
     * @return BelongsTo<TphPoint, $this>
     */
    public function tphPoint(): BelongsTo
    {
        return $this->belongsTo(TphPoint::class);
    }

    /**
     * @return BelongsTo<Worker, $this>
     */
    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    /**
     * @return BelongsToMany<Worker, $this>
     */
    public function workers(): BelongsToMany
    {
        return $this->belongsToMany(Worker::class, 'tph_harvest_record_worker')
            ->withTimestamps();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorder_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function weigher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'weigher_user_id');
    }

    /**
     * @return HasMany<DeliveryOrderItem, $this>
     */
    public function deliveryOrderItems(): HasMany
    {
        return $this->hasMany(DeliveryOrderItem::class);
    }

    public function remainingSacks(): int
    {
        return max(0, $this->sack_count - $this->loaded_sack_count);
    }
}
