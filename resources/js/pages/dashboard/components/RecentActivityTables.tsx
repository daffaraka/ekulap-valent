import { Link } from '@inertiajs/react';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import { formatDateOnly, formatKg } from '@/services/formatters';
import type { DeliveryOrder, TphHarvestRecord } from '@/types';

type RecentActivityTablesProps = {
    recentHarvests: TphHarvestRecord[];
    recentDeliveries: DeliveryOrder[];
};

export function RecentActivityTables({
    recentHarvests,
    recentDeliveries,
}: RecentActivityTablesProps) {
    const resolveWorkerNames = (item: TphHarvestRecord): string => {
        if (item.workers && item.workers.length > 0) {
            return item.workers.map((w) => w.name).join(', ');
        }
        return item.worker?.name ?? '-';
    };

    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="min-w-0 rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm lg:col-span-7">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight text-[#102B26]">
                        Catatan Timbang TPH Terbaru
                    </h2>
                    <Link
                        href="/tph-harvest"
                        className="text-xs font-semibold text-[#1C5143] hover:underline"
                    >
                        Lihat Semua →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#102B26]/10 text-[#5A6C68]">
                                <th className="py-2 pr-3 font-medium">
                                    Lot / Tgl
                                </th>
                                <th className="py-2 pr-3 font-medium">
                                    Blok, TPH &amp; Pekerja
                                </th>
                                <th className="py-2 pr-3 font-medium">
                                    Karung / Berat
                                </th>
                                <th className="py-2 font-medium">
                                    Status Angkut
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#102B26]/8">
                            {recentHarvests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-6 text-center text-xs text-[#5A6C68]"
                                    >
                                        Belum ada catatan timbang TPH.
                                    </td>
                                </tr>
                            ) : (
                                recentHarvests.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-2.5 pr-3">
                                            <div className="font-semibold text-[#102B26]">
                                                {item.lot_number}
                                            </div>
                                            <div className="text-[11px] text-[#5A6C68]">
                                                {formatDateOnly(item.work_date)}
                                            </div>
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            <div className="font-medium text-[#102B26]">
                                                Blok {item.block?.code ?? '-'} ·{' '}
                                                {item.tph_point?.code ?? '-'}
                                            </div>
                                            <div className="text-[11px] text-[#5A6C68]">
                                                {resolveWorkerNames(item)} (
                                                {item.harvest_type})
                                            </div>
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            <div className="font-medium text-[#102B26]">
                                                {item.loaded_sack_count}/
                                                {item.sack_count} Karung
                                            </div>
                                            <div className="text-[11px] text-[#5A6C68]">
                                                {formatKg(item.net_weight_kg)}
                                            </div>
                                        </td>
                                        <td className="py-2.5">
                                            <StatusBadge
                                                status={item.transport_status}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
