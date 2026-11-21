import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { TphHarvestLocationFields } from '@/pages/tph-harvest/components/TphHarvestLocationFields';
import { TphPhotoUploader } from '@/pages/tph-harvest/components/TphPhotoUploader';
import { TphWorkerMultiSelect } from '@/pages/tph-harvest/components/TphWorkerMultiSelect';
import type { Block, TphPoint, WeigherOption, Worker } from '@/types';

type TphHarvestFormModalProps = {
    open: boolean;
    blocks: Block[];
    tphPoints: TphPoint[];
    workers: Worker[];
    weighers: WeigherOption[];
    defaultWeigherId: number;
    harvestTypes: string[];
    onClose: () => void;
};

export function TphHarvestFormModal({
    open,
    blocks,
    tphPoints,
    workers,
    weighers,
    defaultWeigherId,
    harvestTypes,
    onClose,
}: TphHarvestFormModalProps) {
    const today = new Date().toISOString().slice(0, 10);
    const firstBlockId = blocks[0] ? blocks[0].id : null;
    const firstBlockTph =
        tphPoints.find((point) => point.block_id === firstBlockId) ??
        tphPoints[0];

    const { data, setData, post, processing, errors, reset } = useForm<{
        work_date: string;
        block_ids: number[];
        tph_point_id: string;
        worker_ids: number[];
        weigher_user_id: string;
        harvest_type: string;
        sack_count: string;
        tph_count: string;
        gross_weight_kg: string;
        input_latitude: string;
        input_longitude: string;
        photos: File[];
    }>({
        work_date: today,
        block_ids: firstBlockId !== null ? [firstBlockId] : [],
        tph_point_id: firstBlockTph ? String(firstBlockTph.id) : '',
        worker_ids: workers[0] ? [workers[0].id] : [],
        weigher_user_id: String(defaultWeigherId),
        harvest_type: harvestTypes[1] ?? harvestTypes[0] ?? 'Kutip Lapis',
        sack_count: '10',
        tph_count: '1',
        gross_weight_kg: '350',
        input_latitude: firstBlockTph ? String(firstBlockTph.latitude) : '',
        input_longitude: firstBlockTph ? String(firstBlockTph.longitude) : '',
        photos: [],
    });

    if (!open) {
        return null;
    }

    const handleBlocksChange = (nextBlockIds: number[]): void => {
        const prevPrimaryId = data.block_ids[0] ?? null;
        const nextPrimaryId = nextBlockIds[0] ?? null;

        if (nextPrimaryId !== null && nextPrimaryId !== prevPrimaryId) {
            const matchingTph = tphPoints.find(
                (point) => point.block_id === nextPrimaryId,
            );
            if (matchingTph) {
                setData({
                    ...data,
                    block_ids: nextBlockIds,
                    tph_point_id: String(matchingTph.id),
                    input_latitude: String(matchingTph.latitude),
                    input_longitude: String(matchingTph.longitude),
                });
                return;
            }
        }

        setData('block_ids', nextBlockIds);
    };

    const fillMasterGps = (): void => {
        const selected = tphPoints.find(
            (point) => String(point.id) === data.tph_point_id,
        );
        if (!selected) {
            return;
        }
        setData({
            ...data,
            input_latitude: String(selected.latitude),
            input_longitude: String(selected.longitude),
        });
    };

    const handleSubmit = (event: FormEvent): void => {
        event.preventDefault();
        post('/tph-harvest', {
            forceFormData: true,
            onSuccess: () => {
                reset('photos');
                onClose();
            },
        });
    };

    const photoError =
        errors.photos ??
        Object.entries(errors).find(([key]) => key.startsWith('photos.'))?.[1];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B26]/65 p-4">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-[#CFD9CF] bg-white p-5 shadow-xl sm:p-6">
                <div className="flex items-center justify-between border-b border-[#E9EEE9] pb-3">
                    <div>
                        <h2 className="text-base font-bold text-[#102B26]">
                            Input Catatan Hasil &amp; Timbang TPH
                        </h2>
                        <p className="text-xs text-[#466059]">
                            Status awal otomatis: Belum Diangkut (tanpa potongan
                            karung)
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
                    <TphHarvestLocationFields
                        workDate={data.work_date}
                        harvestType={data.harvest_type}
                        blockIds={data.block_ids}
                        tphPointId={data.tph_point_id}
                        weigherUserId={data.weigher_user_id}
                        sackCount={data.sack_count}
                        tphCount={data.tph_count}
                        grossWeightKg={data.gross_weight_kg}
                        inputLatitude={data.input_latitude}
                        inputLongitude={data.input_longitude}
                        blocks={blocks}
                        filteredTphPoints={tphPoints}
                        weighers={weighers}
                        harvestTypes={harvestTypes}
                        errors={errors}
                        onChangeField={(field, value) =>
                            setData(field as keyof typeof data, value)
                        }
                        onBlocksChange={handleBlocksChange}
                        onFillMasterGps={fillMasterGps}
                    />

                    <TphWorkerMultiSelect
                        workers={workers}
                        selectedIds={data.worker_ids}
                        error={errors.worker_ids}
                        onChange={(nextIds) => setData('worker_ids', nextIds)}
                    />

                    <TphPhotoUploader
                        photos={data.photos}
                        minCount={3}
                        maxCount={10}
                        error={photoError}
                        onChange={(nextFiles) => setData('photos', nextFiles)}
                    />

                    <div className="flex justify-end gap-2 border-t border-[#E9EEE9] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-11 rounded-md border border-[#CFD9CF] px-4 text-xs font-semibold text-[#102B26]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={
                                processing ||
                                data.photos.length < 3 ||
                                data.worker_ids.length === 0 ||
                                data.block_ids.length === 0
                            }
                            className="min-h-11 rounded-md bg-[#1C5143] px-5 text-xs font-bold text-white transition hover:bg-[#102B26] disabled:opacity-60"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Catatan TPH'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
