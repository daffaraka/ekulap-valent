import type { Division } from '@/types';

type TphHarvestFilterBarProps = {
    search: string;
    status: string;
    divisionId: string;
    divisions: Division[];
    transportStatuses: string[];
    canCreate: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onDivisionChange: (value: string) => void;
    onApplyFilter: () => void;
    onOpenCreate: () => void;
};

export function TphHarvestFilterBar({
    search,
    status,
    divisionId,
    divisions,
    transportStatuses,
    canCreate,
    onSearchChange,
    onStatusChange,
    onDivisionChange,
    onApplyFilter,
    onOpenCreate,
}: TphHarvestFilterBarProps) {
    const allowedStatuses = transportStatuses.filter(
        (item) => item !== 'Sudah Masuk PKS',
    );

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="grid flex-1 gap-2.5 sm:grid-cols-3">
                <input
                    type="search"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onApplyFilter();
                        }
                    }}
                    placeholder="Cari No. Lot, TPH, atau pekerja..."
                    className="min-h-11 rounded-md border border-[#C8D4C8] bg-[#E9EEE9]/45 px-3 text-xs text-[#102B26] focus:border-[#1C5143] focus:bg-white focus:outline-none"
                />

                <select
                    value={divisionId}
                    onChange={(e) => onDivisionChange(e.target.value)}
                    className="h-11 rounded-md border border-[#C8D4C8] bg-white px-3 py-2 text-xs font-medium text-[#102B26]"
                >
                    <option value="">Semua Divisi</option>
                    {divisions.map((div) => (
                        <option key={div.id} value={div.id}>
                            {div.code} — {div.name}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="h-11 rounded-md border border-[#C8D4C8] bg-white px-3 py-2 text-xs font-medium text-[#102B26]"
                >
                    <option value="">Semua Status Angkut</option>
                    {allowedStatuses.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onApplyFilter}
                    className="min-h-11 rounded-md border border-[#CFD9CF] bg-[#E9EEE9] px-4 text-xs font-bold text-[#102B26] transition hover:bg-[#dfe6df]"
                >
                    Terapkan Filter
                </button>
                {canCreate && (
                    <button
                        type="button"
                        onClick={onOpenCreate}
                        className="min-h-11 rounded-md bg-[#1C5143] px-4 text-xs font-bold text-white transition hover:bg-[#102B26]"
                    >
                        + Catat Timbang TPH
                    </button>
                )}
            </div>
        </div>
    );
}
