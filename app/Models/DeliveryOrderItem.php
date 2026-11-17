<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $delivery_order_id
 * @property int $tph_harvest_record_id
 * @property int $loaded_sacks
 * @property float $estimated_weight_kg
 * @property Carbon $loaded_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'delivery_order_id',
    'tph_harvest_record_id',
    'loaded_sacks',
    'estimated_weight_kg',
    'loaded_at',
])]
class DeliveryOrderItem extends Model
{
    protected function casts(): array
    {
        return [
            'loaded_sacks' => 'integer',
            'estimated_weight_kg' => 'float',
            'loaded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<DeliveryOrder, $this>
     */
    public function deliveryOrder(): BelongsTo
    {
        return $this->belongsTo(DeliveryOrder::class);
    }

    /**
     * @return BelongsTo<TphHarvestRecord, $this>
     */
    public function harvestRecord(): BelongsTo
    {
        return $this->belongsTo(TphHarvestRecord::class, 'tph_harvest_record_id');
    }
}
