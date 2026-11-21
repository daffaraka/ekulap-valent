import { useEffect, useRef, useState } from 'react';
import {
    CameraCaptureModal,
    isLiveCameraSupported,
} from '@/components/ekulap/CameraCaptureModal';
import { IconCamera } from '@/components/ekulap/DuotoneIcons';
import InputError from '@/components/input-error';
import {
    compressImageFilesSequential,
    formatBytesReadable,
} from '@/services/imageCompressor';

type PhotoCaptureFieldProps = {
    label: string;
    photos: File[];
    minCount?: number;
    maxCount: number;
    error?: string;
    fileNamePrefix?: string;
    onChange: (files: File[]) => void;
};

export function PhotoCaptureField({
    label,
    photos,
    minCount = 0,
    maxCount,
    error,
    fileNamePrefix = 'foto',
    onChange,
}: PhotoCaptureFieldProps) {
    const galleryInputRef = useRef<HTMLInputElement | null>(null);
    const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
    const urlMapRef = useRef<Map<File, string>>(new Map());
    const [previews, setPreviews] = useState<string[]>([]);
    const [cameraOpen, setCameraOpen] = useState<boolean>(false);
    const [compressing, setCompressing] = useState<boolean>(false);

    useEffect(() => {
        const currentMap = urlMapRef.current;
        const activeFiles = new Set(photos);

        for (const [file, url] of currentMap.entries()) {
            if (!activeFiles.has(file)) {
                URL.revokeObjectURL(url);
                currentMap.delete(file);
            }
        }

        const nextUrls = photos.map((file) => {
            const existing = currentMap.get(file);
            if (existing) {
                return existing;
            }
            const created = URL.createObjectURL(file);
            currentMap.set(file, created);
            return created;
        });

        setPreviews(nextUrls);
    }, [photos]);

    useEffect(() => {
        const map = urlMapRef.current;
        return () => {
            for (const url of map.values()) {
                URL.revokeObjectURL(url);
            }
            map.clear();
        };
    }, []);

    const appendFiles = async (incomingFiles: File[]): Promise<void> => {
        if (incomingFiles.length === 0) {
            return;
        }
        const remaining = Math.max(0, maxCount - photos.length);
        if (remaining <= 0) {
            return;
        }

        setCompressing(true);
        try {
            const slice = incomingFiles.slice(0, remaining);
            const compressed = await compressImageFilesSequential(slice, {
                fileNamePrefix,
            });
            onChange([...photos, ...compressed].slice(0, maxCount));
        } finally {
            setCompressing(false);
        }
    };

    const handleCameraButtonClick = (): void => {
        if (photos.length >= maxCount || compressing) {
            return;
        }
        if (isLiveCameraSupported()) {
            setCameraOpen(true);
            return;
        }
        nativeCameraInputRef.current?.click();
    };

    const handleLiveCameraCapture = (file: File): void => {
        if (photos.length >= maxCount) {
            return;
        }
        onChange([...photos, file].slice(0, maxCount));
    };

    const removeAt = (index: number): void => {
        onChange(photos.filter((_, idx) => idx !== index));
    };

    const totalBytes = photos.reduce((sum, file) => sum + file.size, 0);
    const isMinimumMet = photos.length >= minCount;
    const isFull = photos.length >= maxCount;

    return (
        <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-[#102B26]">
                    {label}
                </label>
                <span
                    className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                        isMinimumMet
                            ? 'bg-[#1C5143]/12 text-[#1C5143]'
                            : 'bg-[#D6A84F]/20 text-[#5D420B]'
                    }`}
                >
                    {photos.length} / {maxCount} Foto
                    {totalBytes > 0
                        ? ` · ${formatBytesReadable(totalBytes)}`
                        : ''}
                    {!isMinimumMet
                        ? ` (Kurang ${minCount - photos.length})`
                        : ''}
                </span>
            </div>

            <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple={maxCount > 1}
                disabled={isFull || compressing}
                onChange={(e) => {
                    const selected = e.target.files
                        ? Array.from(e.target.files)
                        : [];
                    e.target.value = '';
                    void appendFiles(selected);
                }}
                className="hidden"
            />

            <input
                ref={nativeCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                disabled={isFull || compressing}
                onChange={(e) => {
                    const selected = e.target.files
                        ? Array.from(e.target.files)
                        : [];
                    e.target.value = '';
                    void appendFiles(selected);
                }}
                className="hidden"
            />

            {!isFull && (
                <div className="grid gap-2 sm:grid-cols-2">
                    <button
                        type="button"
                        disabled={compressing}
                        onClick={handleCameraButtonClick}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1C5143] px-3.5 text-xs font-bold text-white transition hover:bg-[#102B26] disabled:opacity-60"
                    >
                        <IconCamera className="size-4 shrink-0" />
                        <span>
                            {compressing
                                ? 'Memproses Foto...'
                                : 'Ambil dari Kamera'}
                        </span>
                    </button>
                    <button
                        type="button"
                        disabled={compressing}
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#1C5143]/40 bg-[#E9EEE9]/60 px-3.5 text-xs font-semibold text-[#1C5143] transition hover:border-[#1C5143] hover:bg-[#E9EEE9] disabled:opacity-60"
                    >
                        <span>+ Pilih dari Galeri / File</span>
                    </button>
                </div>
            )}

            {previews.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                    {previews.map((src, index) => (
                        <div
                            key={src}
                            className="relative w-26 overflow-hidden rounded-lg border border-[#C8D4C8] bg-[#F6F8F6] shadow-xs"
                        >
                            <img
                                src={src}
                                alt={`Lampiran foto ${index + 1}`}
                                loading="lazy"
                                decoding="async"
                                className="h-20 w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeAt(index)}
                                className="absolute top-1 right-1 rounded-md bg-[#102B26]/85 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-[#9E2A2B]"
                                aria-label={`Hapus foto ${index + 1}`}
                            >
                                ✕
                            </button>
                            <div className="bg-white/95 px-1.5 py-0.5 text-center text-[10px] font-medium text-[#466059]">
                                Foto {index + 1} ·{' '}
                                {formatBytesReadable(photos[index]?.size ?? 0)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <InputError message={error} className="mt-1" />

            <CameraCaptureModal
                open={cameraOpen}
                capturedCount={photos.length}
                maxCount={maxCount}
                onCapture={handleLiveCameraCapture}
                onFallbackNativeCamera={() =>
                    nativeCameraInputRef.current?.click()
                }
                onClose={() => setCameraOpen(false)}
            />
        </div>
    );
}
