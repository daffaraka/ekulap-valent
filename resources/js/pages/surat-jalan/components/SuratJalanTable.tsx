import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import { SpbDispatchModal } from '@/pages/surat-jalan/components/SpbDispatchModal';
import { formatDateTime, formatKg } from '@/services/formatters';
import type { DeliveryOrder, PaginatedData } from '@/types';

type SuratJalanTableProps = {
    orders: PaginatedData<DeliveryOrder>;
    canDispatch: boolean;
};

export function SuratJalanTable({ orders, canDispatch }: SuratJalanTableProps) {
    const [dispatchingOrder, setDispatchingOrder] =
        useState<DeliveryOrder | null>(null);

    const columns: DataTableColumn<DeliveryOrder>[] = [
        {
            key: 'spb',
            header: 'No. SPB & Divisi',
            sortValue: (o) => o.spb_number,
            render: (order) => (
                <>
                    <div className="font-bold text-[#102B26]">
                        {order.spb_number}
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        {order.division?.code} — {order.division?.name}
                    </div>
                </>
            ),
        },
        {
            key: 'truck',
            header: 'Armada Truk & Supir',
            sortValue: (o) => o.truck?.plate_number ?? '',
            render: (order) => (
                <>
                    <div className="font-bold text-[#1C5143]">
                        {order.truck?.plate_number ?? '-'}
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        Supir: {order.truck?.driver_name ?? '-'}
                    </div>
                </>
            ),
        },
        {
            key: 'pks',
            header: 'PKS Tujuan & Keterangan',
            sortValue: (o) => o.pks_mill?.name ?? '',
            render: (order) => (
                <>
                    <div className="font-semibold text-[#102B26]">
                        {order.pks_mill?.name ?? '-'}
                    </div>
                    {order.notes && (
                        <div className="max-w-xs truncate text-[11px] text-[#1C5143]">
                            Ket: {order.notes}
                        </div>
                    )}
                    <div className="text-[11px] text-[#466059]">
                        Muat: {order.loader?.name ?? '-'}
                    </div>
                </>
            ),
        },
        {
            key: 'cargo',
            header: 'Muatan Kebun',
            sortValue: (o) => o.total_estimated_kg,
            render: (order) => (
                <>
                    <div className="font-bold text-[#102B26]">
                        {order.total_sacks_loaded} Karung ·{' '}
                        {formatKg(order.total_estimated_kg)}
                    </div>
                    {order.pks_net_weight_kg !== null && (
                        <div className="text-[11px] text-[#466059]">
                            Netto PKS: {formatKg(order.pks_net_weight_kg)}
                        </div>
                    )}
                </>
            ),
        },
        {
            key: 'status',
            header: 'Status & Foto',
            sortValue: (o) => o.delivery_status,
            render: (order) => (
                <>
                    <StatusBadge status={order.delivery_status} />
                    <div className="mt-1 text-[11px] text-[#466059]">
                        Kirim: {formatDateTime(order.departed_at)}
                    </div>
                    {order.loading_photo_paths &&
                        order.loading_photo_paths.length > 0 && (
                            <div className="text-[11px] font-medium text-[#1C5143]">
                                {order.loading_photo_paths.length} Foto Angkut
                            </div>
                        )}
                </>
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (order) => (
                <div className="inline-flex flex-wrap justify-end gap-1.5">
                    <Link
                        href={`/surat-jalan/${order.id}`}
                        className="rounded-lg border border-[#CFD9CF] bg-[#E9EEE9] px-2.5 py-1.5 text-[11px] font-bold text-[#102B26] hover:bg-[#dfe6df]"
                    >
                        Detail / Cetak
                    </Link>
                    {canDispatch && order.delivery_status === 'Belum Muat' && (
                        <button
                            type="button"
                            onClick={() => setDispatchingOrder(order)}
                            className="rounded-lg bg-[#1C5143] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#102B26]"
                        >
                            Kirim SPB
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable
                data={orders.data}
                columns={columns}
                getRowKey={(o) => o.id}
                searchableText={(o) =>
                    `${o.spb_number} ${o.division?.code ?? ''} ${o.truck?.plate_number ?? ''} ${o.truck?.driver_name ?? ''} ${o.pks_mill?.name ?? ''} ${o.notes ?? ''}`
                }
                searchPlaceholder="Cari SPB / nopol / supir / PKS..."
                emptyMessage="Belum ada Surat Jalan (SPB)."
                serverPagination={{
                    current_page: orders.current_page,
                    last_page: orders.last_page,
                    total: orders.total,
                    links: orders.links,
                }}
            />

            <SpbDispatchModal
                key={dispatchingOrder?.id ?? 'none'}
                order={dispatchingOrder}
                onClose={() => setDispatchingOrder(null)}
            />
        </>
    );
}
