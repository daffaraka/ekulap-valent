<?php

namespace App\Enums;

enum RecordStatus: string
{
    case Aktif = 'Aktif';
    case Nonaktif = 'Nonaktif';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
