import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';

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
        const incoming = Array.from(fileList);
        const merged = [...photos, ...incoming].slice(0, maxCount);
        onChange(merged);
    };

    const removeAt = (index: number): void => {
        onChange(photos.filter((_, idx) => idx !== index));
    };

    const isMinimumMet = photos.length >= minCount;

    return (
        <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-[#102B26]">
                    Foto Bukti Lapangan (Min. {minCount}, Maks. {maxCount} Foto)
                </label>
                <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isMinimumMet
                            ? 'bg-[#1C5143]/12 text-[#1C5143]'
                            : 'bg-[#D6A84F]/20 text-[#5D420B]'
                    }`}
                >
                    {photos.length} / {maxCount} Foto
                    {!isMinimumMet
                        ? ` (Kurang ${minCount - photos.length})`
                        : ''}
                </span>
            </div>

            <input
                type="file"
                accept="image/*"
                multiple
                disabled={photos.length >= maxCount}
                onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    e.target.value = '';
                }}
                className="w-full rounded-md border border-[#C8D4C8] bg-[#E9EEE9]/35 p-2 text-xs disabled:opacity-60"
            />

            {previews.length > 0 && (
                <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {previews.map((src, index) => (
                        <div
                            key={`${src}-${index}`}
                            className="group relative overflow-hidden rounded-md border border-[#C8D4C8] bg-[#F6F8F6]"
                        >
                            <img
                                src={src}
                                alt={`Lampiran TPH ${index + 1}`}
                                className="h-18 w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeAt(index)}
                                className="absolute top-1 right-1 rounded bg-[#102B26]/80 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-[#9E2A2B]"
                                aria-label={`Hapus foto ${index + 1}`}
                            >
                                ✕
                            </button>
                            <div className="bg-white/90 px-1.5 py-0.5 text-center text-[10px] font-medium text-[#466059]">
                                Foto {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <InputError message={error} className="mt-1" />
        </div>
    );
}
