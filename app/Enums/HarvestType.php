<?php

namespace App\Enums;

enum HarvestType: string
{
    case Brondolan = 'Brondolan';
    case KutipLapis = 'Kutip Lapis';
    case Tbs = 'TBS';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
