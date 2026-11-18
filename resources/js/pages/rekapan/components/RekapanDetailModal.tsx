import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import type { RekapanDailyRow, RekapanLotItem } from '@/pages/rekapan/types';
import { formatDateOnly, formatKg, formatNumber } from '@/services/formatters';

type RekapanDetailModalProps = {
    row: RekapanDailyRow | null;
    onClose: () => void;
};

const detailColumns: DataTableColumn<RekapanLotItem>[] = [
    {
        key: 'lot',
        header: 'Lot & Jenis',
        sortValue: (i) => i.lot_number,
        render: (item) => (
            <>
                <div className="font-semibold text-[#102B26]">
                    {item.lot_number}
                </div>
                <div className="text-[11px] text-[#5A6C68]">
                    {item.harvest_type}
                </div>
            </>
        ),
    },
    {
        key: 'block',
        header: 'Blok / Stasiun TPH',
        sortValue: (i) => `${i.block_code} ${i.tph_code}`,
        render: (item) => (
            <>
                <div className="font-medium text-[#102B26]">
                    {item.division_code} · Blok {item.block_code}
                </div>
                <div className="text-[11px] text-[#5A6C68]">
                    TPH {item.tph_code} ({item.tph_count} titik)
                </div>
            </>
        ),
    },
    {
        key: 'workers',
        header: 'Tenaga Kerja & Kerani',
        sortValue: (i) => i.worker_names,
        render: (item) => (
            <>
                <div className="text-[#102B26]">{item.worker_names}</div>
                <div className="text-[11px] text-[#5A6C68]">
                    Kerani: {item.weigher_name}
                </div>
            </>
        ),
    },
    {
        key: 'weight',
        header: 'Karung / Netto',
        cellClassName: 'whitespace-nowrap',
        sortValue: (i) => i.net_weight_kg,
        render: (item) => (
            <>
                <div className="font-semibold text-[#102B26]">
                    {formatNumber(item.sack_count)} Krg ·{' '}
                    {formatKg(item.net_weight_kg)}
                </div>
                <div className="text-[11px] text-[#5A6C68]">
                    Terkirim SPB: {formatNumber(item.loaded_sack_count)} Krg
                </div>
            </>
        ),
    },
    {
        key: 'status',
        header: 'Sisa & Umur Restan',
        cellClassName: 'whitespace-nowrap',
        sortValue: (i) => i.restan_days,
        render: (item) => (
            <>
                <StatusBadge status={item.transport_status} />
                <div className="mt-1 text-[11px] text-[#102B26]">
                    Sisa:{' '}
                    <span className="font-semibold">
                        {formatNumber(item.remaining_sacks)} Krg
                    </span>
                    {item.remaining_sacks > 0 && (
                        <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            {item.restan_days} Hari
                        </span>
                    )}
                </div>
            </>
        ),
    },
];

export function RekapanDetailModal({ row, onClose }: RekapanDetailModalProps) {
    if (!row) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-[#102B26]/10 px-5 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-[#102B26]">
                            Rincian Lot Panen &amp; Kutip Lapis —{' '}
                            {formatDateOnly(row.work_date)}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#5A6C68]">
                            {formatNumber(row.lot_count)} Lot ·{' '}
                            {formatNumber(row.total_sacks)} Karung · Netto{' '}
                            {formatKg(row.total_net_kg)} · Sisa Restan{' '}
                            {formatNumber(row.remaining_sacks)} Karung (
                            {formatNumber(row.restan_days)} Hari)
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
                        data={row.records}
                        columns={detailColumns}
                        getRowKey={(i) => i.id}
                        searchableText={(i) =>
                            `${i.lot_number} ${i.block_code} ${i.tph_code} ${i.worker_names} ${i.weigher_name}`
                        }
                        searchPlaceholder="Cari lot / blok / pekerja..."
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
