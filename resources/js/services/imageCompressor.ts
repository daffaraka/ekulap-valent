export type CompressImageOptions = {
    maxDimension?: number;
    quality?: number;
    fileNamePrefix?: string;
};

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.78;
const MIN_BYTES_TO_COMPRESS = 180 * 1024;

function buildOutputFileName(originalName: string, prefix: string): string {
    const cleanBase = originalName.replace(/\.[^.]+$/, '').trim();
    const safeBase = cleanBase !== '' ? cleanBase : `${prefix}-${Date.now()}`;
    return `${safeBase}.jpg`;
}

function resolveTargetDimensions(
    width: number,
    height: number,
    maxDimension: number,
): { width: number; height: number } {
    if (width <= maxDimension && height <= maxDimension) {
        return { width, height };
    }

    if (width >= height) {
        return {
            width: maxDimension,
            height: Math.max(1, Math.round((height / width) * maxDimension)),
        };
    }

    return {
        width: Math.max(1, Math.round((width / height) * maxDimension)),
        height: maxDimension,
    };
}

function loadHtmlImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Gagal membaca file gambar.'));
        };
        img.src = objectUrl;
    });
}

function canvasToJpegBlob(
    canvas: HTMLCanvasElement,
    quality: number,
): Promise<Blob | null> {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    });
}

/**
 * Mengompresi satu file gambar di sisi klien agar penggunaan RAM mobile/tablet
 * dan ukuran payload upload tetap rendah. Selalu melepaskan bitmap & canvas.
 */
export async function compressImageFile(
    file: File,
    options: CompressImageOptions = {},
): Promise<File> {
    if (!file.type.startsWith('image/')) {
        return file;
    }

    const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
    const quality = options.quality ?? DEFAULT_QUALITY;
    const prefix = options.fileNamePrefix ?? 'foto';

    if (file.type === 'image/jpeg' && file.size <= MIN_BYTES_TO_COMPRESS) {
        return file;
    }

    let bitmap: ImageBitmap | null = null;
    const canvas = document.createElement('canvas');

    try {
        let sourceWidth = 0;
        let sourceHeight = 0;
        let drawSource: CanvasImageSource;

        if (typeof createImageBitmap === 'function') {
            bitmap = await createImageBitmap(file);
            sourceWidth = bitmap.width;
            sourceHeight = bitmap.height;
            drawSource = bitmap;
        } else {
            const img = await loadHtmlImage(file);
            sourceWidth = img.naturalWidth;
            sourceHeight = img.naturalHeight;
            drawSource = img;
        }

        if (sourceWidth <= 0 || sourceHeight <= 0) {
            return file;
        }

        const target = resolveTargetDimensions(
            sourceWidth,
            sourceHeight,
            maxDimension,
        );
        canvas.width = target.width;
        canvas.height = target.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return file;
        }

        ctx.drawImage(drawSource, 0, 0, target.width, target.height);

        const blob = await canvasToJpegBlob(canvas, quality);
        if (!blob) {
            return file;
        }

        if (blob.size >= file.size && file.type === 'image/jpeg') {
            return file;
        }

        return new File([blob], buildOutputFileName(file.name, prefix), {
            type: 'image/jpeg',
            lastModified: Date.now(),
        });
    } catch {
        return file;
    } finally {
        if (bitmap) {
            bitmap.close();
        }
        canvas.width = 0;
        canvas.height = 0;
    }
}

/**
 * Memproses beberapa file secara berurutan (bukan paralel) agar puncak pemakaian
 * memori pada HP/tablet kebun tetap kecil (hanya 1 bitmap aktif per waktu).
 */
export async function compressImageFilesSequential(
    files: File[],
    options: CompressImageOptions = {},
): Promise<File[]> {
    const results: File[] = [];
    for (const file of files) {
        const compressed = await compressImageFile(file, options);
        results.push(compressed);
    }
    return results;
}

export function formatBytesReadable(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
