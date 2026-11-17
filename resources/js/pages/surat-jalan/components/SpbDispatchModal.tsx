import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { SpbPhotoUploader } from '@/pages/surat-jalan/components/SpbPhotoUploader';
import type { DeliveryOrder } from '@/types';

type SpbDispatchModalProps = {
    order: DeliveryOrder | null;
    onClose: () => void;
};

export function SpbDispatchModal({ order, onClose }: SpbDispatchModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        loading_photos: File[];
    }>({
        loading_photos: [],
    });

    if (!order) {
        return null;
    }

    const hasExistingPhotos =
        Boolean(order.loading_photo_paths) &&
        (order.loading_photo_paths?.length ?? 0) > 0;

    const handleSubmit = (event: FormEvent): void => {
        event.preventDefault();
        post(`/surat-jalan/${order.id}/dispatch`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const photoError =
        errors.loading_photos ??
        Object.entries(errors).find(([key]) =>
            key.startsWith('loading_photos.'),
        )?.[1];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B26]/65 p-4">
            <div className="w-full max-w-lg rounded-lg border border-[#CFD9CF] bg-white p-5 shadow-xl sm:p-6">
                <div className="flex items-center justify-between border-b border-[#E9EEE9] pb-3">
                    <div>
                        <h2 className="text-base font-bold text-[#102B26]">
                            Kirim Surat Jalan (Sudah Dikirim)
                        </h2>
                        <p className="text-xs text-[#466059]">
                            {order.spb_number} · {order.truck?.plate_number} →{' '}
                            {order.pks_mill?.name}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2.5 py-1 text-sm font-bold text-[#466059]"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {hasExistingPhotos && (
                        <div className="rounded-md bg-[#E9EEE9]/65 p-3 text-xs text-[#102B26]">
                            SPB ini sudah memiliki{' '}
                            <strong>{order.loading_photo_paths?.length}</strong>{' '}
                            foto pengangkutan. Anda dapat langsung mengirim atau
                            mengganti foto di bawah.
                        </div>
                    )}

                    <SpbPhotoUploader
                        photos={data.loading_photos}
                        required={!hasExistingPhotos}
                        error={photoError}
                        onChange={(files) => setData('loading_photos', files)}
                    />

                    <div className="flex justify-end gap-2 border-t border-[#E9EEE9] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-11 rounded-md border border-[#CFD9CF] px-4 text-xs font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={
                                processing ||
                                (!hasExistingPhotos &&
                                    data.loading_photos.length === 0)
                            }
                            className="min-h-11 rounded-md bg-[#1C5143] px-5 text-xs font-bold text-white disabled:opacity-60"
                        >
                            {processing
                                ? 'Mengirim...'
                                : 'Tandai Sudah Dikirim'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
