<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'Admin';
    case KeraniProduksi = 'Kerani Produksi';
    case SupervisiAsisten = 'Supervisi/Asisten';
    case Pimpinan = 'Pimpinan (EM/RC)';
    case Supir = 'Supir';
    case CheckerPks = 'Checker PKS';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
