<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $division_id
 * @property string $code
 * @property int $planting_year
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['division_id', 'code', 'planting_year'])]
class Block extends Model
{
    protected function casts(): array
    {
        return [
            'planting_year' => 'integer',
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
     * @return HasMany<TphPoint, $this>
     */
    public function tphPoints(): HasMany
    {
        return $this->hasMany(TphPoint::class);
    }

    /**
     * @return HasMany<TphHarvestRecord, $this>
     */
    public function harvestRecords(): HasMany
    {
        return $this->hasMany(TphHarvestRecord::class);
    }

    /**
     * @return BelongsToMany<TphHarvestRecord, $this>
     */
    public function multiHarvestRecords(): BelongsToMany
    {
        return $this->belongsToMany(TphHarvestRecord::class, 'tph_harvest_record_block')
            ->withTimestamps();
    }
}
