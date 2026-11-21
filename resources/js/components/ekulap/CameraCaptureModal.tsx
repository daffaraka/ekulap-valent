import { useCallback, useEffect, useRef, useState } from 'react';

type CameraCaptureModalProps = {
    open: boolean;
    capturedCount: number;
    maxCount: number;
    onCapture: (file: File) => void;
    onFallbackNativeCamera: () => void;
    onClose: () => void;
};

const CAPTURE_MAX_WIDTH = 1280;
const CAPTURE_JPEG_QUALITY = 0.78;

export function isLiveCameraSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.isSecureContext &&
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices !== undefined &&
        'getUserMedia' in navigator.mediaDevices
    );
}

export function CameraCaptureModal({
    open,
    capturedCount,
    maxCount,
    onCapture,
    onFallbackNativeCamera,
    onClose,
}: CameraCaptureModalProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
        'environment',
    );
    const [starting, setStarting] = useState<boolean>(false);
    const [capturing, setCapturing] = useState<boolean>(false);
    const [flashFeedback, setFlashFeedback] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const stopStream = useCallback((): void => {
        const current = streamRef.current;
        if (current) {
            current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        const video = videoRef.current;
        if (video) {
            video.pause();
            video.srcObject = null;
            video.load();
        }
    }, []);

    const startStream = useCallback(
        async (mode: 'environment' | 'user'): Promise<void> => {
            stopStream();
            setStarting(true);
            setCameraError(null);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: { ideal: mode },
                        width: { ideal: 1280, max: 1600 },
                        height: { ideal: 720, max: 1200 },
                    },
                });
                streamRef.current = stream;

                const video = videoRef.current;
                if (video) {
                    video.srcObject = stream;
                    await video.play();
                }
            } catch {
                stopStream();
                setCameraError(
                    'Kamera langsung tidak dapat diakses (izin ditolak atau perangkat tidak mendukung). Gunakan kamera bawaan HP di bawah.',
                );
            } finally {
                setStarting(false);
            }
        },
        [stopStream],
    );

    useEffect(() => {
        if (!open) {
            stopStream();
            return;
        }

        void startStream(facingMode);

        const handleVisibility = (): void => {
            if (document.hidden) {
                stopStream();
            } else {
                void startStream(facingMode);
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('pagehide', stopStream);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('pagehide', stopStream);
            stopStream();
        };
    }, [open, facingMode, startStream, stopStream]);

    if (!open) {
        return null;
    }

    const remainingSlots = Math.max(0, maxCount - capturedCount);

    const handleSnap = (): void => {
        const video = videoRef.current;
        if (
            !video ||
            video.videoWidth === 0 ||
            video.videoHeight === 0 ||
            capturing ||
            remainingSlots <= 0
        ) {
            return;
        }

        setCapturing(true);
        const canvas = document.createElement('canvas');

        const scale =
            video.videoWidth > CAPTURE_MAX_WIDTH
                ? CAPTURE_MAX_WIDTH / video.videoWidth
                : 1;
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            canvas.width = 0;
            canvas.height = 0;
            setCapturing(false);
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                canvas.width = 0;
                canvas.height = 0;
                setCapturing(false);

                if (!blob) {
                    return;
                }

                const file = new File(
                    [blob],
                    `kamera-ekulap-${Date.now()}.jpg`,
                    {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    },
                );
                onCapture(file);
                setFlashFeedback(true);
                window.setTimeout(() => setFlashFeedback(false), 180);

                if (capturedCount + 1 >= maxCount) {
                    stopStream();
                    onClose();
                }
            },
            'image/jpeg',
            CAPTURE_JPEG_QUALITY,
        );
    };

    const handleClose = (): void => {
        stopStream();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-3 sm:p-4">
            <div className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/15 bg-[#102B26] text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
                    <div>
                        <h3 className="text-sm font-bold">
                            Kamera Lapangan eKULAP
                        </h3>
                        <p className="text-[11px] text-white/75">
                            Foto tersimpan: {capturedCount} / {maxCount} (hemat
                            memori · otomatis kompresi)
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="min-h-9 rounded-lg border border-white/20 px-3 text-xs font-semibold hover:bg-white/10"
                    >
                        Selesai
                    </button>
                </div>

                <div className="relative flex aspect-4/3 w-full items-center justify-center bg-black">
                    {cameraError ? (
                        <div className="space-y-3 p-5 text-center">
                            <p className="text-xs text-amber-200">
                                {cameraError}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    stopStream();
                                    onClose();
                                    onFallbackNativeCamera();
                                }}
                                className="min-h-11 rounded-lg bg-[#D6A84F] px-4 text-xs font-bold text-[#102B26]"
                            >
                                Buka Kamera Bawaan HP / Tablet
                            </button>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                playsInline
                                muted
                                autoPlay
                                className="h-full w-full object-cover"
                            />
                            {starting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-medium">
                                    Menyiapkan kamera...
                                </div>
                            )}
                            {flashFeedback && (
                                <div className="pointer-events-none absolute inset-0 bg-white/55" />
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 bg-[#0B201C] px-4 py-3.5">
                    <button
                        type="button"
                        onClick={() =>
                            setFacingMode((prev) =>
                                prev === 'environment' ? 'user' : 'environment',
                            )
                        }
                        disabled={starting || Boolean(cameraError)}
                        className="min-h-11 rounded-lg border border-white/20 px-3 text-xs font-semibold text-white/90 hover:bg-white/10 disabled:opacity-40"
                    >
                        Balik Kamera
                    </button>

                    <button
                        type="button"
                        onClick={handleSnap}
                        disabled={
                            starting ||
                            capturing ||
                            Boolean(cameraError) ||
                            remainingSlots <= 0
                        }
                        className="min-h-12 flex-1 rounded-lg bg-[#D6A84F] px-5 text-xs font-bold text-[#102B26] transition hover:bg-[#e3b963] disabled:opacity-40"
                    >
                        {capturing
                            ? 'Menyimpan...'
                            : `Ambil Foto (${capturedCount}/${maxCount})`}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            stopStream();
                            onClose();
                            onFallbackNativeCamera();
                        }}
                        className="min-h-11 rounded-lg border border-white/20 px-3 text-xs font-semibold text-white/90 hover:bg-white/10"
                        title="Gunakan aplikasi kamera bawaan perangkat"
                    >
                        Kamera HP
                    </button>
                </div>
            </div>
        </div>
    );
}
