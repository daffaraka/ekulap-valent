import type { TphHarvestRecord } from '@/types';

type TphPhotoPreviewModalProps = {
    record: TphHarvestRecord | null;
    onClose: () => void;
};

export function TphPhotoPreviewModal({
    record,
    onClose,
}: TphPhotoPreviewModalProps) {
    if (!record) {
        return null;
    }

    const photos =
        record.photo_paths && record.photo_paths.length > 0
            ? record.photo_paths
            : record.photo_path
              ? [record.photo_path]
              : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B26]/70 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[#CFD9CF] bg-white p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#E9EEE9] pb-3">
                    <div>
                        <h3 className="text-sm font-bold text-[#102B26]">
                            Dokumentasi Foto Timbang TPH — {record.lot_number}
                        </h3>
                        <p className="text-xs text-[#5A6C68]">
                            {photos.length} foto bukti lapangan tersimpan
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2.5 py-1 text-sm font-bold text-[#466059] hover:bg-[#E9EEE9]"
                    >
                        ✕
                    </button>
                </div>

                {photos.length === 0 ? (
                    <div className="mt-4 rounded-md bg-[#F6F8F6] p-6 text-center text-xs text-[#5A6C68]">
                        Tidak ada foto terlampir pada catatan ini.
                    </div>
                ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {photos.map((path, index) => (
                            <a
                                key={`${path}-${index}`}
                                href={`/storage/${path}`}
                                target="_blank"
                                rel="noreferrer"
                                className="overflow-hidden rounded-md border border-[#CFD9CF] bg-[#F6F8F6]"
                            >
                                <img
                                    src={`/storage/${path}`}
                                    alt={`${record.lot_number} foto ${index + 1}`}
                                    className="h-44 w-full object-cover"
                                />
                                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#102B26]">
                                    Foto #{index + 1}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
