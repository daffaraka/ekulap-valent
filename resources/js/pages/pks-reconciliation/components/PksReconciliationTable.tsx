import { Link } from '@inertiajs/react';
import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import {
    calculateShrinkagePercent,
    formatDateTime,
    formatKg,
} from '@/services/formatters';
import type { DeliveryOrder, PaginatedData } from '@/types';

type PksReconciliationTableProps = {
    orders: PaginatedData<DeliveryOrder>;
    canWeigh: boolean;
    onSelectOrder: (order: DeliveryOrder) => void;
};

export function PksReconciliationTable({
    orders,
    canWeigh,
    onSelectOrder,
}: PksReconciliationTableProps) {
    const columns: DataTableColumn<DeliveryOrder>[] = [
        {
            key: 'spb',
            header: 'SPB & Truk',
            sortValue: (o) => o.spb_number,
            render: (order) => (
                <>
                    <Link
                        href={`/surat-jalan/${order.id}`}
                        className="font-bold text-[#1C5143] hover:underline"
                    >
                        {order.spb_number}
                    </Link>
                    <div className="text-[11px] text-[#466059]">
                        {order.truck?.plate_number} · {order.truck?.driver_name}
                    </div>
                    {order.notes && (
                        <div className="max-w-xs truncate text-[11px] text-[#5A6C68]">
                            {order.notes}
                        </div>
                    )}
                </>
            ),
        },
        {
            key: 'pks',
            header: 'PKS & Tiket',
            sortValue: (o) => o.pks_mill?.name ?? '',
            render: (order) => (
                <>
                    <div className="font-semibold text-[#102B26]">
                        {order.pks_mill?.name ?? '-'}
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        Tiket: {order.pks_ticket_number ?? 'Menunggu PKS'}
                    </div>
                </>
            ),
        },
        {
            key: 'estimated',
            header: 'Estimasi Kebun',
            sortValue: (o) => o.total_estimated_kg,
            render: (order) => (
                <span className="font-semibold">
                    {order.total_sacks_loaded} Karung ·{' '}
                    {formatKg(order.total_estimated_kg)}
                </span>
            ),
        },
        {
            key: 'pks_net',
            header: 'Netto Timbang PKS',
            sortValue: (o) => o.pks_net_weight_kg ?? -1,
            render: (order) => (
                <>
                    <div className="font-bold text-[#102B26]">
                        {formatKg(order.pks_net_weight_kg)}
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        Tiba: {formatDateTime(order.arrived_at)}
                    </div>
                </>
            ),
        },
        {
            key: 'shrinkage',
            header: 'Selisih Susut',
            sortValue: (o) =>
                calculateShrinkagePercent(
                    o.total_estimated_kg,
                    o.weight_shrinkage_kg,
                ),
            render: (order) => {
                if (order.weight_shrinkage_kg === null) {
                    return <span className="text-[#466059]">-</span>;
                }
                const pct = calculateShrinkagePercent(
                    order.total_estimated_kg,
                    order.weight_shrinkage_kg,
                );
                const high = Math.abs(pct) > 2;
                return (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            high
                                ? 'bg-[#9E2A2B]/14 text-[#8C2323]'
                                : 'bg-[#1C5143]/12 text-[#1C5143]'
                        }`}
                    >
                        {formatKg(order.weight_shrinkage_kg)} ({pct}%)
                    </span>
                );
            },
        },
        {
            key: 'status',
            header: 'Status',
            sortValue: (o) => o.delivery_status,
            render: (order) => <StatusBadge status={order.delivery_status} />,
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (order) =>
                canWeigh && order.pks_net_weight_kg === null ? (
                    <button
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className="rounded-lg bg-[#1C5143] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#102B26]"
                    >
                        Input Timbang PKS
                    </button>
                ) : (
                    <Link
                        href={`/surat-jalan/${order.id}`}
                        className="rounded-lg border border-[#CFD9CF] px-2.5 py-1 text-[11px] font-semibold text-[#102B26]"
                    >
                        Lihat SPB
                    </Link>
                ),
        },
    ];

    return (
        <DataTable
            data={orders.data}
            columns={columns}
            getRowKey={(o) => o.id}
            searchableText={(o) =>
                `${o.spb_number} ${o.truck?.plate_number ?? ''} ${o.pks_mill?.name ?? ''} ${o.pks_ticket_number ?? ''}`
            }
            searchPlaceholder="Cari SPB / nopol / PKS / tiket..."
            emptyMessage="Belum ada data pengiriman ke PKS."
            serverPagination={{
                current_page: orders.current_page,
                last_page: orders.last_page,
                total: orders.total,
                links: orders.links,
            }}
        />
    );
}
