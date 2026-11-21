import { DatePickerInput } from '@/components/ekulap/DatePickerInput';
import type { Division } from '@/types';

type RekapanFilterBarProps = {
    dateFrom: string;
    dateTo: string;
    divisionId: string;
    divisions: Division[];
    exportHref?: string;
    exportLabel?: string;
    onChangeDateFrom: (value: string) => void;
    onChangeDateTo: (value: string) => void;
    onChangeDivisionId: (value: string) => void;
    onApply: () => void;
    onReset: () => void;
};

export function RekapanFilterBar({
    dateFrom,
    dateTo,
    divisionId,
    divisions,
    exportHref,
    exportLabel = 'Ekspor CSV Harian',
    onChangeDateFrom,
    onChangeDateTo,
    onChangeDivisionId,
    onApply,
    onReset,
}: RekapanFilterBarProps) {
    return (
        <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-[#102B26]">
                        Dari Tanggal
                    </label>
                    <DatePickerInput
                        value={dateFrom}
                        onChange={onChangeDateFrom}
                        placeholder="Pilih tanggal mulai"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-[#102B26]">
                        Sampai Tanggal
                    </label>
                    <DatePickerInput
                        value={dateTo}
                        onChange={onChangeDateTo}
                        placeholder="Pilih tanggal akhir"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-[#102B26]">
                        Divisi / Afdeling
                    </label>
                    <select
                        value={divisionId}
                        onChange={(e) => onChangeDivisionId(e.target.value)}
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] bg-white px-3 text-xs text-[#102B26]"
                    >
                        <option value="">Semua Divisi</option>
                        {divisions.map((div) => (
                            <option key={div.id} value={String(div.id)}>
                                {div.code} — {div.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end gap-2">
                    <button
                        type="button"
                        onClick={onApply}
                        className="min-h-11 flex-1 rounded-md bg-[#1C5143] px-4 text-xs font-semibold text-white hover:bg-[#102B26]"
                    >
                        Terapkan
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="min-h-11 rounded-md border border-[#C8D4C8] px-3 text-xs font-medium text-[#102B26] hover:bg-[#F6F8F6]"
                    >
                        Reset
                    </button>
                </div>
                {exportHref && (
                    <div className="flex items-end">
                        <a
                            href={exportHref}
                            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#1C5143] px-3 text-xs font-semibold text-[#1C5143] hover:bg-[#E8F1EC]"
                        >
                            {exportLabel}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
