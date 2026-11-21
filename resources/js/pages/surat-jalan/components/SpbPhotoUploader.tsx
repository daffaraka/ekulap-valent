import { PhotoCaptureField } from '@/components/ekulap/PhotoCaptureField';

type SpbPhotoUploaderProps = {
    photos: File[];
    required: boolean;
    error?: string;
    onChange: (files: File[]) => void;
};

export function SpbPhotoUploader({
    photos,
    required,
    error,
    onChange,
}: SpbPhotoUploaderProps) {
    return (
        <PhotoCaptureField
            label={`Foto Pengangkutan SPB (1 atau 2 Foto${required ? ' — Wajib' : ' — Opsional saat Belum Muat'})`}
            photos={photos}
            minCount={required ? 1 : 0}
            maxCount={2}
            error={error}
            fileNamePrefix="spb-muat"
            onChange={onChange}
        />
    );
}
