<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageCompressionService
{
    public function storeCompressedImage(
        UploadedFile $file,
        string $directory,
        string $disk = 'public',
        int $maxDimension = 1600,
        int $quality = 78,
    ): string {
        if (! function_exists('imagecreatefromstring') || ! function_exists('imagejpeg')) {
            return (string) $file->store($directory, $disk);
        }

        $rawContent = @file_get_contents($file->getRealPath());
        if ($rawContent === false || $rawContent === '') {
            return (string) $file->store($directory, $disk);
        }

        $source = @imagecreatefromstring($rawContent);
        if ($source === false) {
            return (string) $file->store($directory, $disk);
        }

        $source = $this->applyExifOrientation($source, $file->getRealPath());

        $origWidth = imagesx($source);
        $origHeight = imagesy($source);

        $targetWidth = $origWidth;
        $targetHeight = $origHeight;

        if ($origWidth > $maxDimension || $origHeight > $maxDimension) {
            $ratio = min($maxDimension / $origWidth, $maxDimension / $origHeight);
            $targetWidth = max(1, (int) round($origWidth * $ratio));
            $targetHeight = max(1, (int) round($origHeight * $ratio));
        }

        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
        if ($canvas === false) {
            imagedestroy($source);

            return (string) $file->store($directory, $disk);
        }

        $white = imagecolorallocate($canvas, 255, 255, 255);
        if ($white !== false) {
            imagefill($canvas, 0, 0, $white);
        }

        imagecopyresampled(
            $canvas,
            $source,
            0,
            0,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $origWidth,
            $origHeight,
        );

        ob_start();
        $encoded = imagejpeg($canvas, null, $quality);
        $compressedBinary = ob_get_clean();

        imagedestroy($source);
        imagedestroy($canvas);

        if (! $encoded || ! is_string($compressedBinary) || $compressedBinary === '') {
            return (string) $file->store($directory, $disk);
        }

        $filename = trim($directory, '/').'/'.Str::uuid().'.jpg';
        Storage::disk($disk)->put($filename, $compressedBinary);

        return $filename;
    }

    private function applyExifOrientation(\GdImage $image, string|false $filePath): \GdImage
    {
        if ($filePath === false || ! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($filePath);
        if (! is_array($exif) || ! isset($exif['Orientation'])) {
            return $image;
        }

        $rotated = match ((int) $exif['Orientation']) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => false,
        };

        if ($rotated instanceof \GdImage) {
            imagedestroy($image);

            return $rotated;
        }

        return $image;
    }
}
