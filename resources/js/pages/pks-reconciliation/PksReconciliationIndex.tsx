import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { PksReconciliationTable } from '@/pages/pks-reconciliation/components/PksReconciliationTable';
import { PksWeighModal } from '@/pages/pks-reconciliation/components/PksWeighModal';
import { formatKg, formatNumber } from '@/services/formatters';
import type { DeliveryOrder, PaginatedData, User } from '@/types';

type PksReconciliationIndexProps = {
    orders: PaginatedData<DeliveryOrder>;
    filters: { status: string };
    summary: {
        waiting_sacks_to_pks: number;
        total_estimated_kg: number;
        unsent_days: number;
        today_sent_percentage: number;
        today_sent_sacks: number;
        today_total_sacks: number;
    };
    deliveryStatuses: string[];
};

export default function PksReconciliationIndex({
    orders,
    filters,
    summary,
    deliveryStatuses,
}: PksReconciliationIndexProps) {
    const page = usePage<{ auth: { user: User } }>();
    const role = page.props.auth.user.role;
    const canWeigh =
        role === 'Admin' ||
        role === 'Checker PKS' ||
        role === 'Supervisi/Asisten';

    const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(
        null,
    );

    const handleFilter = (status: string): void => {
        router.get('/pks-reconciliation', status ? { status } : {}, {
            preserveState: true,
        });
    };

    return (
        <AdminLayout
            title="Status Kutip Lapis"
            subtitle="Pemantauan karung menunggu ke PKS, hari belum dikirim, & persentase pengiriman harian"
        >
            <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                        <div className="text-xs text-[#5A6C68]">
                            Menunggu ke PKS
                        </div>
                        <div className="mt-1 text-xl font-semibold text-[#102B26]">
                            {formatNumber(summary.waiting_sacks_to_pks)} Karung
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                        <div className="text-xs text-[#5A6C68]">
                            Total Estimasi Kebun
                        </div>
                        <div className="mt-1 text-xl font-semibold text-[#102B26]">
                            {formatKg(summary.total_estimated_kg)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                        <div className="text-xs text-[#5A6C68]">
                            Belum Dikirim
                        </div>
                        <div className="mt-1 text-xl font-semibold text-[#102B26]">
                            {formatNumber(summary.unsent_days)} Hari
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                        <div className="text-xs text-[#5A6C68]">
                            Persentase Hari Ini
                        </div>
                        <div className="mt-1 text-xl font-semibold text-[#1C5143]">
                            {summary.today_sent_percentage}%
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                            {formatNumber(summary.today_sent_sacks)} /{' '}
                            {formatNumber(summary.today_total_sacks)} Karung
                            hari ini
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilter(e.target.value)}
                        className="h-11 rounded-md border border-[#C8D4C8] bg-white px-3 py-2 text-xs font-medium"
                    >
                        <option value="">Semua Status SPB</option>
                        {deliveryStatuses.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <a
                        href="/pks-reconciliation/export"
                        className="inline-flex min-h-11 items-center rounded-md border border-[#1C5143] bg-[#E9EEE9] px-4 text-xs font-bold text-[#102B26] transition hover:bg-[#dfe6df]"
                    >
                        Ekspor Laporan CSV (Siap Excel)
                    </a>
                </div>

                <PksReconciliationTable
                    orders={orders}
                    canWeigh={canWeigh}
                    onSelectOrder={setSelectedOrder}
                />

                <PksWeighModal
                    key={selectedOrder?.id ?? 'none'}
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            </div>
        </AdminLayout>
    );
}
