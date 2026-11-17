<?php

namespace App\Services;

use App\Models\DeliveryOrder;
use App\Models\TphHarvestRecord;
use Illuminate\Support\Carbon;

class LotCodeGeneratorService
{
    public function nextHarvestLotNumber(?Carbon $date = null): string
    {
        $datePart = ($date ?? now())->format('Ymd');
        $prefix = "HRV-{$datePart}-";

        $lastCode = TphHarvestRecord::query()
            ->where('lot_number', 'like', "{$prefix}%")
            ->orderByDesc('lot_number')
            ->value('lot_number');

        return $this->incrementSequence($prefix, is_string($lastCode) ? $lastCode : null);
    }

    public function nextSpbNumber(?Carbon $date = null): string
    {
        $datePart = ($date ?? now())->format('Ymd');
        $prefix = "SPB-{$datePart}-";

        $lastCode = DeliveryOrder::query()
            ->where('spb_number', 'like', "{$prefix}%")
            ->orderByDesc('spb_number')
            ->value('spb_number');

        return $this->incrementSequence($prefix, is_string($lastCode) ? $lastCode : null);
    }

    private function incrementSequence(string $prefix, ?string $lastCode): string
    {
        if ($lastCode === null) {
            return "{$prefix}001";
        }

        $lastSegment = (int) substr($lastCode, strlen($prefix));
        $nextNumber = str_pad((string) ($lastSegment + 1), 3, '0', STR_PAD_LEFT);

        return "{$prefix}{$nextNumber}";
    }
}
