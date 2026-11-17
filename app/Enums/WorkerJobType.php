<?php

namespace App\Enums;

enum WorkerJobType: string
{
    case PemanenTbs = 'Pemanen TBS';
    case KutipLapisBrondolan = 'Kutip Lapis Brondolan';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
