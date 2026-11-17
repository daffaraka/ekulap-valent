import { useEffect, useRef, useState } from 'react';
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
        const merged = [...photos, ...Array.from(fileList)].slice(0, 2);
        onChange(merged);
    };

    const removeAt = (index: number): void => {
        onChange(photos.filter((_, idx) => idx !== index));
    };

    return (
        <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-[#102B26]">
                    Foto Pengangkutan SPB (1 atau 2 Foto
                    {required ? ' — Wajib' : ' — Opsional saat Belum Muat'})
                </label>
                <span className="rounded-full bg-[#1C5143]/12 px-2.5 py-0.5 text-[11px] font-bold text-[#1C5143]">
                    {photos.length} / 2 Foto
                </span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={photos.length >= 2}
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
                    className="flex min-h-20 w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[#1C5143]/35 bg-[#E9EEE9]/40 px-4 py-3 text-xs font-semibold text-[#1C5143] transition hover:border-[#1C5143] hover:bg-[#E9EEE9]/70"
                >
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#1C5143] text-lg font-bold text-white">
                        +
                    </span>
                    <span>Pilih Foto Pengangkutan SPB</span>
                </button>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    {previews.map((src, index) => (
                        <div
                            key={`${src}-${index}`}
                            className="relative w-32 overflow-hidden rounded-md border border-[#C8D4C8] bg-[#F6F8F6] shadow-xs"
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
                            <div className="bg-white/95 px-1.5 py-0.5 text-center text-[10px] font-medium text-[#466059]">
                                Foto {index + 1}
                            </div>
                        </div>
                    ))}

                    {photos.length < 2 && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Tambah foto SPB"
                            aria-label="Tambah foto SPB"
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
