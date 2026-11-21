import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import type { RekapanStationRow } from '@/pages/rekapan/types';
import { formatDateOnly, formatKg, formatNumber } from '@/services/formatters';

type RekapanStationTableProps = {
    rows: RekapanStationRow[];
    onSelectStation: (row: RekapanStationRow) => void;
};

export function RekapanStationTable({
    rows,
    onSelectStation,
}: RekapanStationTableProps) {
    const columns: DataTableColumn<RekapanStationRow>[] = [
        {
            key: 'tph_code',
            header: 'Stasiun (Titik TPH)',
            sortValue: (s) => s.tph_code,
            render: (row) => (
                <>
                    <div className="font-bold text-[#1C5143]">
                        {row.tph_code}
                    </div>
                    <div className="text-[11px] text-[#5A6C68]">
                        {row.location_label}
                    </div>
                </>
            ),
        },
        {
            key: 'blocks',
            header: 'Divisi & Blok',
            sortValue: (s) => s.block_codes.join(', '),
            render: (row) => (
                <>
                    <div className="font-medium text-[#102B26]">
                        {row.division_codes.join(', ')}
                    </div>
                    <div className="text-[11px] text-[#5A6C68]">
                        Blok: {row.block_codes.join(', ')}
                    </div>
                </>
            ),
        },
        {
            key: 'workers',
            header: 'Pekerja & Penimbang',
            sortValue: (s) => s.worker_names.join(', '),
            render: (row) => (
                <>
                    <div className="font-medium text-[#102B26]">
                        {row.worker_names.join(', ') || '-'}
                    </div>
                    <div className="text-[11px] text-[#5A6C68]">
                        Penimbang: {row.weigher_names.join(', ') || '-'}
                    </div>
                </>
            ),
        },
        {
            key: 'restan_sacks',
            header: 'Total Karung Restan',
            cellClassName: 'whitespace-nowrap',
            sortValue: (s) => s.restan_sacks,
            render: (row) => (
                <>
                    <div className="font-bold text-[#102B26]">
                        {formatNumber(row.restan_sacks)} Karung ·{' '}
                        {formatKg(row.restan_net_kg)}
                    </div>
                    <div className="text-[11px] text-[#5A6C68]">
                        Di TPH: {formatNumber(row.unloaded_sacks)} · SPB Belum
                        Muat: {formatNumber(row.belum_muat_sacks)}
                    </div>
                </>
            ),
        },
        {
            key: 'max_restan_days',
            header: 'Restan Terlama',
            cellClassName: 'whitespace-nowrap',
            sortValue: (s) => s.max_restan_days,
            render: (row) => {
                const tone =
                    row.max_restan_days >= 2
                        ? 'bg-red-100 text-red-800'
                        : row.max_restan_days === 1
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#E9EEE9] text-[#102B26]';
                return (
                    <>
                        <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tone}`}
                        >
                            {row.max_restan_days === 0
                                ? 'Hari Ini (0 Hari)'
                                : `${formatNumber(row.max_restan_days)} Hari`}
                        </span>
                        <div className="mt-1 text-[11px] text-[#5A6C68]">
                            Tertua: {formatDateOnly(row.oldest_work_date)}
                        </div>
                    </>
                );
            },
        },
        {
            key: 'breakdown',
            header: 'Rincian Umur Restan',
            render: (row) => (
                <div className="flex flex-wrap gap-1.5">
                    {row.age_breakdown.map((bucket) => (
                        <span
                            key={bucket.days}
                            className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${
                                bucket.days >= 2
                                    ? 'bg-red-50 text-red-800 ring-1 ring-red-200'
                                    : bucket.days === 1
                                      ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                                      : 'bg-[#F6F8F6] text-[#102B26] ring-1 ring-[#C8D4C8]'
                            }`}
                        >
                            {bucket.days === 0
                                ? '0 Hari'
                                : `${bucket.days} Hari`}
                            : {formatNumber(bucket.sacks)} Krg
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Rincian',
            align: 'right',
            cellClassName: 'whitespace-nowrap',
            render: (row) => (
                <button
                    type="button"
                    onClick={() => onSelectStation(row)}
                    className="min-h-9 rounded-md border border-[#1C5143] px-3 text-xs font-semibold text-[#1C5143] hover:bg-[#E8F1EC]"
                >
                    Detail Stasiun ({row.lot_count})
                </button>
            ),
        },
    ];

    return (
        <DataTable
            data={rows}
            columns={columns}
            getRowKey={(s) => s.tph_point_id}
            searchableText={(s) =>
                `${s.tph_code} ${s.location_label} ${s.block_codes.join(' ')} ${s.division_codes.join(' ')} ${s.worker_names.join(' ')} ${s.weigher_names.join(' ')}`
            }
            searchPlaceholder="Cari stasiun TPH / blok / pekerja / penimbang..."
            emptyMessage="Tidak ada sisa restan di stasiun TPH pada rentang filter ini."
        />
    );
}
