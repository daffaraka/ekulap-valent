<?php

namespace App\Services;

class GpsDistanceService
{
    private const EARTH_RADIUS_METERS = 6371000.0;

    public const DEFAULT_MAX_TOLERANCE_METERS = 100.0;

    public function calculateDistanceMeters(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2,
    ): float {
        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(
            (sin($latDelta / 2) ** 2)
            + cos($latFrom) * cos($latTo) * (sin($lonDelta / 2) ** 2)
        ));

        return round($angle * self::EARTH_RADIUS_METERS, 2);
    }

    public function isWithinTolerance(
        ?float $distanceMeters,
        float $maxToleranceMeters = self::DEFAULT_MAX_TOLERANCE_METERS,
    ): bool {
        if ($distanceMeters === null) {
            return true;
        }

        return $distanceMeters <= $maxToleranceMeters;
    }
}
