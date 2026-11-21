import { PhotoCaptureField } from '@/components/ekulap/PhotoCaptureField';

type TphPhotoUploaderProps = {
    photos: File[];
    minCount?: number;
    maxCount?: number;
    error?: string;
    onChange: (files: File[]) => void;
};

export function TphPhotoUploader({
    photos,
    minCount = 3,
    maxCount = 10,
    error,
    onChange,
}: TphPhotoUploaderProps) {
    return (
        <PhotoCaptureField
            label={`Foto Bukti Lapangan (Min. ${minCount}, Maks. ${maxCount} Foto)`}
            photos={photos}
            minCount={minCount}
            maxCount={maxCount}
            error={error}
            fileNamePrefix="tph-bukti"
            onChange={onChange}
        />
    );
}
