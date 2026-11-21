import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { PhotoCaptureField } from '@/components/ekulap/PhotoCaptureField';
import InputError from '@/components/input-error';
import { formatKg } from '@/services/formatters';
import type { DeliveryOrder } from '@/types';

type PksWeighModalProps = {
    order: DeliveryOrder | null;
    onClose: () => void;
};

export function PksWeighModal({ order, onClose }: PksWeighModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        pks_ticket_number: string;
        pks_net_weight_kg: string;
        pks_slip_photo: File | null;
    }>({
        pks_ticket_number: order?.pks_ticket_number ?? '',
        pks_net_weight_kg: order ? String(order.total_estimated_kg) : '',
        pks_slip_photo: null,
    });

    if (!order) {
        return null;
    }

    const pksWeight = Number(data.pks_net_weight_kg || 0);
    const shrinkageKg = Number(
        (order.total_estimated_kg - pksWeight).toFixed(2),
    );
    const shrinkagePct =
        order.total_estimated_kg > 0
            ? Number(
                  ((shrinkageKg / order.total_estimated_kg) * 100).toFixed(2),
              )
            : 0;

    const handleSubmit = (event: FormEvent): void => {
        event.preventDefault();
        post(`/pks-reconciliation/${order.id}/weigh`, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B26]/65 p-4">
            <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#CFD9CF] bg-white p-5 shadow-xl sm:p-6">
                <div className="flex items-center justify-between border-b border-[#E9EEE9] pb-3">
                    <div>
                        <h2 className="text-base font-bold text-[#102B26]">
                            Input Timbangan Jembatan PKS
                        </h2>
                        <p className="text-xs text-[#466059]">
                            {order.spb_number} • {order.truck?.plate_number} →{' '}
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
                    <div className="rounded-md bg-[#E9EEE9]/65 p-3 text-xs">
                        <div className="flex justify-between">
                            <span className="text-[#466059]">
                                Total Estimasi Kebun
                            </span>
                            <span className="font-bold text-[#102B26]">
                                {order.total_sacks_loaded} Karung •{' '}
                                {formatKg(order.total_estimated_kg)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold">
                            Nomor Tiket Timbang PKS
                        </label>
                        <input
                            type="text"
                            value={data.pks_ticket_number}
                            onChange={(e) =>
                                setData('pks_ticket_number', e.target.value)
                            }
                            required
                            placeholder="Contoh: TKT-SM-88501"
                            className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                        <InputError message={errors.pks_ticket_number} />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold">
                            Berat Bersih Timbangan PKS (Kg)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min={1}
                            value={data.pks_net_weight_kg}
                            onChange={(e) =>
                                setData('pks_net_weight_kg', e.target.value)
                            }
                            required
                            className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs font-bold"
                        />
                        <InputError message={errors.pks_net_weight_kg} />
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-[#D6A84F]/55 bg-[#D6A84F]/15 px-4 py-2.5 text-xs">
                        <span className="font-semibold text-[#5D420B]">
                            Selisih / Susut Otomatis
                        </span>
                        <span className="font-bold text-[#102B26]">
                            {formatKg(shrinkageKg)} ({shrinkagePct}%)
                        </span>
                    </div>

                    <PhotoCaptureField
                        label="Foto Struk Timbangan PKS (Opsional)"
                        photos={
                            data.pks_slip_photo ? [data.pks_slip_photo] : []
                        }
                        minCount={0}
                        maxCount={1}
                        error={errors.pks_slip_photo}
                        fileNamePrefix="slip-pks"
                        onChange={(files) =>
                            setData('pks_slip_photo', files[0] ?? null)
                        }
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
                            disabled={processing}
                            className="min-h-11 rounded-md bg-[#1C5143] px-5 text-xs font-bold text-white"
                        >
                            {processing
                                ? 'Menyimpan...'
                                : 'Simpan & Selesaikan PKS'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
