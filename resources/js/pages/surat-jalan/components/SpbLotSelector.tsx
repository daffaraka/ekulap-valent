import InputError from '@/components/input-error';
import { formatKg } from '@/services/formatters';
import type { AvailableLotOption } from '@/types';

type SpbLotSelectorProps = {
    lots: AvailableLotOption[];
    selectedSacks: Record<number, number>;
    error?: string;
    onToggleLot: (lot: AvailableLotOption) => void;
    onUpdateSacks: (lot: AvailableLotOption, value: number) => void;
};

export function SpbLotSelector({
    lots,
    selectedSacks,
    error,
    onToggleLot,
    onUpdateSacks,
}: SpbLotSelectorProps) {
    const totalPickedSacks = Object.values(selectedSacks).reduce(
        (acc, val) => acc + val,
        0,
    );

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#102B26]">
                    Pilih Stasiun TPH yang Masih Ada Sisa Karung ({lots.length}{' '}
                    Stasiun)
                </span>
                <span className="rounded-lg bg-[#1C5143]/12 px-2.5 py-1 text-xs font-bold text-[#1C5143]">
                    Terpilih: {totalPickedSacks} Karung
                </span>
            </div>

            <InputError message={error} className="mb-2" />

            {lots.length === 0 ? (
                <div className="rounded-md border border-[#CFD9CF] bg-[#E9EEE9]/50 p-4 text-xs text-[#466059]">
                    Tidak ada stasiun dengan sisa karung di divisi ini.
                </div>
            ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-[#CFD9CF] p-2.5">
                    {lots.map((lot) => {
                        const checked = selectedSacks[lot.id] !== undefined;

                        return (
                            <div
                                key={lot.id}
                                className={`flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-xs ${
                                    checked
                                        ? 'border-[#1C5143] bg-[#1C5143]/8'
                                        : 'border-[#E9EEE9] bg-white'
                                }`}
                            >
                                <label className="flex cursor-pointer items-start gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => onToggleLot(lot)}
                                        className="mt-0.5 size-4 accent-[#1C5143]"
                                    />
                                    <div>
                                        <div className="font-bold text-[#102B26]">
                                            {lot.lot_number} · Blok{' '}
                                            {lot.block_code ?? '-'} ·{' '}
                                            {lot.tph_code}
                                        </div>
                                        <div className="text-[11px] text-[#466059]">
                                            {lot.worker_name} · Sisa{' '}
                                            {lot.remaining_sacks}/
                                            {lot.sack_count} Karung (
                                            {formatKg(lot.net_weight_kg)})
                                        </div>
                                    </div>
                                </label>

                                {checked && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold">
                                            Muat Karung:
                                        </span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={lot.remaining_sacks}
                                            value={selectedSacks[lot.id]}
                                            onChange={(e) =>
                                                onUpdateSacks(
                                                    lot,
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="min-h-9 w-20 rounded-lg border border-[#1C5143] px-2 text-center text-xs font-bold"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
