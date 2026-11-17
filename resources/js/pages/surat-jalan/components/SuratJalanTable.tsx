import { Link } from '@inertiajs/react';
import { useState } from 'react';
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

    return (
        <div className="overflow-hidden rounded-lg border border-[#102B26]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#102B26]/10 bg-[#E9EEE9]/70 text-[#5A6C68]">
                        <tr>
                            <th className="px-4 py-3 font-semibold">
                                No. SPB &amp; Divisi
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Armada Truk &amp; Supir
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                PKS Tujuan &amp; Keterangan
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Muatan Kebun
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Status &amp; Foto
                            </th>
                            <th className="px-4 py-3 text-right font-semibold">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9EEE9]">
                        {orders.data.map((order) => (
                            <tr
                                key={order.id}
                                className="hover:bg-[#E9EEE9]/35"
                            >
                                <td className="px-4 py-3">
                                    <div className="font-bold text-[#102B26]">
                                        {order.spb_number}
                                    </div>
                                    <div className="text-[11px] text-[#466059]">
                                        {order.division?.code} —{' '}
                                        {order.division?.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-[#1C5143]">
                                        {order.truck?.plate_number ?? '-'}
                                    </div>
                                    <div className="text-[11px] text-[#466059]">
                                        Supir: {order.truck?.driver_name ?? '-'}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
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
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-[#102B26]">
                                        {order.total_sacks_loaded} Karung ·{' '}
                                        {formatKg(order.total_estimated_kg)}
                                    </div>
                                    {order.pks_net_weight_kg !== null && (
                                        <div className="text-[11px] text-[#466059]">
                                            Netto PKS:{' '}
                                            {formatKg(order.pks_net_weight_kg)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge
                                        status={order.delivery_status}
                                    />
                                    <div className="mt-1 text-[11px] text-[#466059]">
                                        Kirim:{' '}
                                        {formatDateTime(order.departed_at)}
                                    </div>
                                    {order.loading_photo_paths &&
                                        order.loading_photo_paths.length >
                                            0 && (
                                            <div className="text-[11px] font-medium text-[#1C5143]">
                                                {
                                                    order.loading_photo_paths
                                                        .length
                                                }{' '}
                                                Foto Angkut
                                            </div>
                                        )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="inline-flex flex-wrap justify-end gap-1.5">
                                        <Link
                                            href={`/surat-jalan/${order.id}`}
                                            className="rounded-lg border border-[#CFD9CF] bg-[#E9EEE9] px-2.5 py-1.5 text-[11px] font-bold text-[#102B26] hover:bg-[#dfe6df]"
                                        >
                                            Detail / Cetak
                                        </Link>
                                        {canDispatch &&
                                            order.delivery_status ===
                                                'Belum Muat' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDispatchingOrder(
                                                            order,
                                                        )
                                                    }
                                                    className="rounded-lg bg-[#1C5143] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#102B26]"
                                                >
                                                    Kirim SPB
                                                </button>
                                            )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SpbDispatchModal
                key={dispatchingOrder?.id ?? 'none'}
                order={dispatchingOrder}
                onClose={() => setDispatchingOrder(null)}
            />
        </div>
    );
}
