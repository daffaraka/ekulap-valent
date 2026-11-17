<?php

namespace App\Enums;

enum TransportStatus: string
{
    case BelumDiangkut = 'Belum Diangkut';
    case DiangkutSebagian = 'Diangkut Sebagian';
    case SudahDiangkut = 'Sudah Diangkut';
    case SudahMasukPks = 'Sudah Masuk PKS';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
