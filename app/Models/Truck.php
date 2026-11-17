<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $plate_number
 * @property string $driver_name
 * @property string $driver_phone
 * @property int $capacity_kg
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['plate_number', 'driver_name', 'driver_phone', 'capacity_kg'])]
class Truck extends Model
{
    protected function casts(): array
    {
        return [
            'capacity_kg' => 'integer',
        ];
    }

    /**
     * @return HasMany<DeliveryOrder, $this>
     */
    public function deliveryOrders(): HasMany
    {
        return $this->hasMany(DeliveryOrder::class);
    }
}
