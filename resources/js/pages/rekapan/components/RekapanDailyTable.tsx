import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import type { RekapanDailyRow } from '@/pages/rekapan/types';
import { formatDateOnly, formatKg, formatNumber } from '@/services/formatters';

type RekapanDailyTableProps = {
    rows: RekapanDailyRow[];
    onSelectDate: (row: RekapanDailyRow) => void;
};

const renderRestanAge = (row: RekapanDailyRow) => {
    if (row.remaining_sacks <= 0) {
        return (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Terangkut Semua
            </span>
        );
    }

    const tone =
        row.restan_days >= 2
            ? 'bg-red-100 text-red-800'
            : row.restan_days === 1
              ? 'bg-amber-100 text-amber-800'
              : 'bg-[#E9EEE9] text-[#102B26]';

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}
        >
            {row.restan_days === 0
                ? 'Hari Ini (0 Hari)'
                : `${formatNumber(row.restan_days)} Hari`}
        </span>
    );
};

export function RekapanDailyTable({
    rows,
    onSelectDate,
}: RekapanDailyTableProps) {
    const columns: DataTableColumn<RekapanDailyRow>[] = [
        {
            key: 'work_date',
            header: 'Tanggal',
            cellClassName: 'font-semibold whitespace-nowrap text-[#102B26]',
            sortValue: (r) => r.work_date,
            render: (row) => formatDateOnly(row.work_date),
        },
        {
            key: 'divisions',
            header: 'Divisi & Blok',
            sortValue: (r) => r.divisions.join(', '),
            render: (row) => (
                <>
                    <div className="font-medium text-[#102B26]">
                        {row.divisions.join(', ') || '-'}
                    </div>
                    <div className="text-[11px] text-[#5A6C68]">
                        Blok: {row.blocks.join(', ') || '-'}
                    </div>
                </>
            ),
        },
        {
            key: 'lots',
            header: 'Lot / TPH',
            cellClassName: 'whitespace-nowrap text-[#102B26]',
            sortValue: (r) => r.lot_count,
            render: (row) =>
                `${formatNumber(row.lot_count)} Lot · ${formatNumber(row.tph_count)} TPH`,
        },
        {
            key: 'total_sacks',
            header: 'Total Panen',
            cellClassName: 'whitespace-nowrap',
            sortValue: (r) => r.total_sacks,
            render: (row) => (
                <>
                    <div className="font-semibold text-[#102B26]">
                        {formatNumber(row.total_sacks)} Karung
                    </div>
                    <div className="text-[11px] font-semibold text-[#1C5143]">
                        {formatKg(row.total_net_kg)}
                    </div>
                </>
            ),
        },
        {
            key: 'remaining_sacks',
            header: 'Sisa Restan',
            cellClassName: 'whitespace-nowrap',
            sortValue: (r) => r.remaining_sacks,
            render: (row) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        row.remaining_sacks > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                    }`}
                >
                    {formatNumber(row.remaining_sacks)} Karung
                </span>
            ),
        },
        {
            key: 'restan_days',
            header: 'Umur Restan',
            cellClassName: 'whitespace-nowrap',
            sortValue: (r) => r.restan_days,
            render: renderRestanAge,
        },
        {
            key: 'actions',
            header: 'Rincian',
            align: 'right',
            cellClassName: 'whitespace-nowrap',
            render: (row) => (
                <button
                    type="button"
                    onClick={() => onSelectDate(row)}
                    className="min-h-9 rounded-md border border-[#1C5143] px-3 text-xs font-semibold text-[#1C5143] hover:bg-[#E8F1EC]"
                >
                    Detail Lot ({row.lot_count})
                </button>
            ),
        },
    ];

    return (
        <DataTable
            data={rows}
            columns={columns}
            getRowKey={(r) => r.work_date}
            searchableText={(r) =>
                `${r.work_date} ${formatDateOnly(r.work_date)} ${r.divisions.join(' ')} ${r.blocks.join(' ')}`
            }
            searchPlaceholder="Cari tanggal / divisi / blok..."
            emptyMessage="Belum ada catatan panen & kutip lapis pada rentang tanggal ini."
        />
    );
}
