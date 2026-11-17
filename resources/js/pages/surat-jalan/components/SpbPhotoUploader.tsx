import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';

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
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        const urls = photos.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [photos]);

    const handleFilesSelected = (fileList: FileList | null): void => {
        if (!fileList || fileList.length === 0) {
            return;
        }
        const merged = [...photos, ...Array.from(fileList)].slice(0, 2);
        onChange(merged);
    };

    const removeAt = (index: number): void => {
        onChange(photos.filter((_, idx) => idx !== index));
    };

    return (
        <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-[#102B26]">
                    Foto Pengangkutan SPB (1 atau 2 Foto
                    {required ? ' — Wajib' : ' — Opsional saat Belum Muat'})
                </label>
                <span className="rounded-full bg-[#1C5143]/12 px-2.5 py-0.5 text-[11px] font-bold text-[#1C5143]">
                    {photos.length} / 2 Foto
                </span>
            </div>

            <input
                type="file"
                accept="image/*"
                multiple
                disabled={photos.length >= 2}
                onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    e.target.value = '';
                }}
                className="w-full rounded-md border border-[#C8D4C8] bg-[#E9EEE9]/35 p-2 text-xs disabled:opacity-60"
            />

            {previews.length > 0 && (
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                    {previews.map((src, index) => (
                        <div
                            key={`${src}-${index}`}
                            className="relative overflow-hidden rounded-md border border-[#C8D4C8] bg-[#F6F8F6]"
                        >
                            <img
                                src={src}
                                alt={`Foto pengangkutan SPB ${index + 1}`}
                                className="h-24 w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeAt(index)}
                                className="absolute top-1.5 right-1.5 rounded bg-[#102B26]/80 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-[#9E2A2B]"
                                aria-label={`Hapus foto SPB ${index + 1}`}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <InputError message={error} className="mt-1" />
        </div>
    );
}
