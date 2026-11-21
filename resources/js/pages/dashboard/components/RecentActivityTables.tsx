import { Link } from '@inertiajs/react';
import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import { formatDateOnly, formatKg } from '@/services/formatters';
import type { DeliveryOrder, TphHarvestRecord } from '@/types';

type RecentActivityTablesProps = {
    recentHarvests: TphHarvestRecord[];
    recentDeliveries: DeliveryOrder[];
};

const resolveWorkerNames = (item: TphHarvestRecord): string => {
    if (item.workers && item.workers.length > 0) {
        return item.workers.map((w) => w.name).join(', ');
    }
    return item.worker?.name ?? '-';
};

const resolveBlockCodes = (item: TphHarvestRecord): string => {
    if (item.blocks && item.blocks.length > 0) {
        return item.blocks.map((b) => b.code).join(', ');
    }
    return item.block?.code ?? '-';
};

const harvestColumns: DataTableColumn<TphHarvestRecord>[] = [
    {
        key: 'lot',
        header: 'Stasiun / Tgl',
        sortValue: (row) => `${row.work_date} ${row.lot_number}`,
        render: (item) => (
            <>
                <div className="font-semibold text-[#102B26]">
                    {item.lot_number}
                </div>
                <div className="text-[11px] text-[#5A6C68]">
                    {formatDateOnly(item.work_date)}
                </div>
            </>
        ),
    },
    {
        key: 'location',
        header: 'Blok, TPH & Pekerja',
        sortValue: (row) =>
            `${resolveBlockCodes(row)} ${row.tph_point?.code ?? ''}`,
        render: (item) => (
            <>
                <div className="font-medium text-[#102B26]">
                    Blok {resolveBlockCodes(item)} ·{' '}
                    {item.tph_point?.code ?? '-'}
                </div>
                <div className="text-[11px] text-[#5A6C68]">
                    {resolveWorkerNames(item)} ({item.harvest_type})
                </div>
            </>
        ),
    },
    {
        key: 'weight',
        header: 'Karung / Berat',
        sortValue: (row) => row.net_weight_kg,
        render: (item) => (
            <>
                <div className="font-medium text-[#102B26]">
                    {item.loaded_sack_count}/{item.sack_count} Karung
                </div>
                <div className="text-[11px] text-[#5A6C68]">
                    {formatKg(item.net_weight_kg)}
                </div>
            </>
        ),
    },
    {
        key: 'status',
        header: 'Status Angkut',
        sortValue: (row) => row.transport_status,
        render: (item) => <StatusBadge status={item.transport_status} />,
    },
];

export function RecentActivityTables({
    recentHarvests,
    recentDeliveries,
}: RecentActivityTablesProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="min-w-0 rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm lg:col-span-7">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-semibold tracking-tight text-[#102B26]">
                        Catatan Timbang TPH Terbaru
                    </h2>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/rekapan-kutip-lapis"
                            className="text-xs font-semibold text-[#1C5143] hover:underline"
                        >
                            Rekapan per Tanggal →
                        </Link>
                        <Link
                            href="/tph-harvest"
                            className="text-xs font-semibold text-[#1C5143] hover:underline"
                        >
                            Lihat Semua →
                        </Link>
                    </div>
                </div>

                <DataTable
                    data={recentHarvests}
                    columns={harvestColumns}
                    getRowKey={(row) => row.id}
                    defaultPageSize={5}
                    showPageSize={false}
                    searchableText={(row) =>
                        `${row.lot_number} ${resolveBlockCodes(row)} ${row.tph_point?.code ?? ''} ${resolveWorkerNames(row)}`
                    }
                    searchPlaceholder="Cari stasiun / blok / pekerja..."
                    emptyMessage="Belum ada catatan timbang TPH."
                />
            </div>

            <div className="min-w-0 rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm lg:col-span-5">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight text-[#102B26]">
                        Surat Jalan Truk (SPB) Terbaru
                    </h2>
                    <Link
                        href="/surat-jalan"
                        className="text-xs font-semibold text-[#1C5143] hover:underline"
                    >
                        Kelola SPB →
                    </Link>
                </div>
                <div className="space-y-2.5">
                    {recentDeliveries.length === 0 ? (
                        <div className="rounded-md bg-[#F6F8F6] p-6 text-center text-xs text-[#5A6C68]">
                            Belum ada Surat Jalan (SPB).
                        </div>
                    ) : (
                        recentDeliveries.map((spb) => (
                            <Link
                                key={spb.id}
                                href={`/surat-jalan/${spb.id}`}
                                className="ek-card-link group flex items-center justify-between gap-2 rounded-md border border-[#102B26]/10 bg-[#F6F8F6] p-3 hover:border-[#1C5143]/40"
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-xs font-semibold text-[#102B26] group-hover:text-[#1C5143]">
                                        {spb.spb_number} ·{' '}
                                        {spb.truck?.plate_number}
                                    </div>
                                    <div className="truncate text-[11px] text-[#5A6C68]">
                                        {spb.pks_mill?.name} ·{' '}
                                        {spb.total_sacks_loaded} Karung (
                                        {formatKg(spb.total_estimated_kg)})
                                    </div>
                                    <div className="mt-1 text-[11px] font-semibold text-[#1C5143]">
                                        Buka Surat SPB →
                                    </div>
                                </div>
                                <StatusBadge status={spb.delivery_status} />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
