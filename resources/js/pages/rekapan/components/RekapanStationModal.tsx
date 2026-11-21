import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import type {
    RekapanStationRow,
    StationRestanLot,
} from '@/pages/rekapan/types';
import { formatDateOnly, formatKg, formatNumber } from '@/services/formatters';

type RekapanStationModalProps = {
    station: RekapanStationRow | null;
    onClose: () => void;
};

const lotColumns: DataTableColumn<StationRestanLot>[] = [
    {
        key: 'lot',
        header: 'Stasiun & Tgl Panen',
        sortValue: (i) => `${i.work_date} ${i.lot_number}`,
        render: (item) => (
            <>
                <div className="font-semibold text-[#102B26]">
                    {item.lot_number}
                </div>
                <div className="text-[11px] text-[#5A6C68]">
                    {formatDateOnly(item.work_date)} · Blok {item.block_code}
                </div>
            </>
        ),
    },
    {
        key: 'workers',
        header: 'Pekerja & Penimbang',
        sortValue: (i) => i.worker_names,
        render: (item) => (
            <>
                <div className="text-[#102B26]">{item.worker_names}</div>
                <div className="text-[11px] text-[#5A6C68]">
                    Penimbang: {item.weigher_name} · {item.harvest_type}
                </div>
            </>
        ),
    },
    {
        key: 'sacks',
        header: 'Sisa Karung & Netto',
        cellClassName: 'whitespace-nowrap',
        sortValue: (i) => i.restan_sacks,
        render: (item) => (
            <>
                <div className="font-semibold text-[#102B26]">
                    {formatNumber(item.restan_sacks)} /{' '}
                    {formatNumber(item.sack_count)} Krg ·{' '}
                    {formatKg(item.restan_net_kg)}
                </div>
                <div className="text-[11px] text-[#5A6C68]">
                    TPH: {formatNumber(item.unloaded_sacks)} · SPB Belum Muat:{' '}
                    {formatNumber(item.belum_muat_sacks)}
                </div>
            </>
        ),
    },
    {
        key: 'age',
        header: 'Lama Restan',
        cellClassName: 'whitespace-nowrap',
        sortValue: (i) => i.restan_days,
        render: (item) => {
            const tone =
                item.restan_days >= 2
                    ? 'bg-red-100 text-red-800'
                    : item.restan_days === 1
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#E9EEE9] text-[#102B26]';
            return (
                <div className="flex flex-col items-start gap-1">
                    <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tone}`}
                    >
                        {item.restan_days === 0
                            ? 'Hari Ini (0 Hari)'
                            : `${formatNumber(item.restan_days)} Hari`}
                    </span>
                    <StatusBadge status={item.transport_status} />
                </div>
            );
        },
    },
];

export function RekapanStationModal({
    station,
    onClose,
}: RekapanStationModalProps) {
    if (!station) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-[#102B26]/10 px-5 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-[#102B26]">
                            Rincian Restan Stasiun {station.tph_code}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#5A6C68]">
                            {station.location_label} · Total{' '}
                            {formatNumber(station.restan_sacks)} Karung ·
                            Terlama {formatNumber(station.max_restan_days)} Hari
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-2.5 py-1 text-sm font-semibold text-[#5A6C68] hover:bg-[#F6F8F6] hover:text-[#102B26]"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto p-4">
                    <DataTable
                        data={station.records}
                        columns={lotColumns}
                        getRowKey={(i) => i.id}
                        searchableText={(i) =>
                            `${i.lot_number} ${i.block_code} ${i.worker_names} ${i.weigher_name} ${i.work_date}`
                        }
                        searchPlaceholder="Cari stasiun / blok / pekerja / penimbang..."
                        defaultPageSize={10}
                    />
                </div>

                <div className="flex justify-end border-t border-[#102B26]/10 px-5 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-10 rounded-md bg-[#1C5143] px-4 text-xs font-semibold text-white hover:bg-[#102B26]"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
