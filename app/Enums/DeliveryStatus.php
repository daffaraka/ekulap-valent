<?php

namespace App\Enums;

enum DeliveryStatus: string
{
    case BelumMuat = 'Belum Muat';
    case SudahDikirim = 'Sudah Dikirim';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
