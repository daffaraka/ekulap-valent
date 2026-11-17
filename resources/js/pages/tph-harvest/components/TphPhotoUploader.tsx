import { useEffect, useRef, useState } from 'react';
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
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
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
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={photos.length >= maxCount}
                onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    e.target.value = '';
                }}
                className="hidden"
            />

            {previews.length === 0 ? (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-22 w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[#1C5143]/35 bg-[#E9EEE9]/40 px-4 py-4 text-xs font-semibold text-[#1C5143] transition hover:border-[#1C5143] hover:bg-[#E9EEE9]/70"
                >
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#1C5143] text-lg font-bold text-white">
                        +
                    </span>
                    <span>Pilih atau Ambil Foto Lapangan</span>
                </button>
            ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                    {previews.map((src, index) => (
                        <div
                            key={`${src}-${index}`}
                            className="relative w-26 overflow-hidden rounded-md border border-[#C8D4C8] bg-[#F6F8F6] shadow-xs"
                        >
                            <img
                                src={src}
                                alt={`Lampiran TPH ${index + 1}`}
                                className="h-20 w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeAt(index)}
                                className="absolute top-1 right-1 rounded bg-[#102B26]/80 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-[#9E2A2B]"
                                aria-label={`Hapus foto ${index + 1}`}
                            >
                                ✕
                            </button>
                            <div className="bg-white/95 px-1.5 py-0.5 text-center text-[10px] font-medium text-[#466059]">
                                Foto {index + 1}
                            </div>
                        </div>
                    ))}

                    {photos.length < maxCount && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Tambah foto bukti"
                            aria-label="Tambah foto bukti"
                            className="flex size-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#1C5143]/45 bg-[#E9EEE9]/55 text-2xl font-bold text-[#1C5143] transition hover:border-[#1C5143] hover:bg-[#1C5143]/12"
                        >
                            +
                        </button>
                    )}
                </div>
            )}

            <InputError message={error} className="mt-1" />
        </div>
    );
}
