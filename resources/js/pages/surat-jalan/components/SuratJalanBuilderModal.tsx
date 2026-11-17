import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { SpbLotSelector } from '@/pages/surat-jalan/components/SpbLotSelector';
import { SpbMetadataFields } from '@/pages/surat-jalan/components/SpbMetadataFields';
import { SpbPhotoUploader } from '@/pages/surat-jalan/components/SpbPhotoUploader';
import type { AvailableLotOption, Division, PksMill, Truck } from '@/types';

type SuratJalanBuilderModalProps = {
    open: boolean;
    divisions: Division[];
    trucks: Truck[];
    pksMills: PksMill[];
    availableLots: AvailableLotOption[];
    onClose: () => void;
};

export function SuratJalanBuilderModal({
    open,
    divisions,
    trucks,
    pksMills,
    availableLots,
    onClose,
}: SuratJalanBuilderModalProps) {
    const [selectedSacks, setSelectedSacks] = useState<Record<number, number>>(
        {},
    );

    const { data, setData, post, processing, errors, transform, reset } =
        useForm<{
            division_id: string;
            truck_id: string;
            pks_mill_id: string;
            notes: string;
            delivery_status: 'Belum Muat' | 'Sudah Dikirim';
            loading_photos: File[];
            items: Array<{
                tph_harvest_record_id: number;
                loaded_sacks: number;
            }>;
        }>({
            division_id: divisions[0] ? String(divisions[0].id) : '',
            truck_id: trucks[0] ? String(trucks[0].id) : '',
            pks_mill_id: pksMills[0] ? String(pksMills[0].id) : '',
            notes: '',
            delivery_status: 'Sudah Dikirim',
            loading_photos: [],
            items: [],
        });

    if (!open) {
        return null;
    }

    const filteredLots = availableLots.filter(
        (lot) =>
            !data.division_id || String(lot.division_id) === data.division_id,
    );

    const toggleLot = (lot: AvailableLotOption): void => {
        setSelectedSacks((prev) => {
            const next = { ...prev };
            if (next[lot.id] !== undefined) {
                delete next[lot.id];
            } else {
                next[lot.id] = lot.remaining_sacks;
            }
            return next;
        });
    };

    const updateLotSacks = (lot: AvailableLotOption, value: number): void => {
        const clamped = Math.max(1, Math.min(lot.remaining_sacks, value || 1));
        setSelectedSacks((prev) => ({
            ...prev,
            [lot.id]: clamped,
        }));
    };

    const handleSubmit = (event: FormEvent): void => {
        event.preventDefault();
        const itemList = Object.entries(selectedSacks).map(([id, sacks]) => ({
            tph_harvest_record_id: Number(id),
            loaded_sacks: sacks,
        }));

        transform((current) => ({
            ...current,
            items: itemList,
        }));

        post('/surat-jalan', {
            forceFormData: true,
            onSuccess: () => {
                setSelectedSacks({});
                reset('notes', 'loading_photos');
                onClose();
            },
        });
    };

    const totalPickedSacks = Object.values(selectedSacks).reduce(
        (a, b) => a + b,
        0,
    );
    const requiresPhoto = data.delivery_status === 'Sudah Dikirim';
    const photoError =
        errors.loading_photos ??
        Object.entries(errors).find(([key]) =>
            key.startsWith('loading_photos.'),
        )?.[1];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B26]/65 p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[#CFD9CF] bg-white p-5 shadow-xl sm:p-6">
                <div className="flex items-center justify-between border-b border-[#E9EEE9] pb-3">
                    <div>
                        <h2 className="text-base font-bold text-[#102B26]">
                            Buat Surat Jalan Truk (SPB)
                        </h2>
                        <p className="text-xs text-[#466059]">
                            Muat penuh/sebagian karung TPH, tambah keterangan
                            SPB, &amp; lampirkan 1–2 foto pengangkutan
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

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <SpbMetadataFields
                        divisionId={data.division_id}
                        truckId={data.truck_id}
                        pksMillId={data.pks_mill_id}
                        deliveryStatus={data.delivery_status}
                        notes={data.notes}
                        divisions={divisions}
                        trucks={trucks}
                        pksMills={pksMills}
                        notesError={errors.notes}
                        onDivisionChange={(val) => {
                            setData('division_id', val);
                            setSelectedSacks({});
                        }}
                        onTruckChange={(val) => setData('truck_id', val)}
                        onPksMillChange={(val) => setData('pks_mill_id', val)}
                        onStatusChange={(val) =>
                            setData('delivery_status', val)
                        }
                        onNotesChange={(val) => setData('notes', val)}
                    />

                    <SpbPhotoUploader
                        photos={data.loading_photos}
                        required={requiresPhoto}
                        error={photoError}
                        onChange={(files) => setData('loading_photos', files)}
                    />

                    <SpbLotSelector
                        lots={filteredLots}
                        selectedSacks={selectedSacks}
                        error={errors.items}
                        onToggleLot={toggleLot}
                        onUpdateSacks={updateLotSacks}
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
                                totalPickedSacks === 0 ||
                                (requiresPhoto &&
                                    data.loading_photos.length === 0)
                            }
                            className="min-h-11 rounded-md bg-[#1C5143] px-5 text-xs font-bold text-white transition hover:bg-[#102B26] disabled:opacity-60"
                        >
                            {processing
                                ? 'Memproses...'
                                : 'Terbitkan Surat Jalan (SPB)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
