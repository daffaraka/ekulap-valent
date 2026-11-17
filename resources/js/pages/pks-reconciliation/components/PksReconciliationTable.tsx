import { Link } from '@inertiajs/react';
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
    return (
        <div className="overflow-hidden rounded-lg border border-[#102B26]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#102B26]/10 bg-[#E9EEE9]/70 text-[#5A6C68]">
                        <tr>
                            <th className="px-4 py-3 font-semibold">
                                SPB &amp; Truk
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                PKS &amp; Tiket
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Estimasi Kebun
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Netto Timbang PKS
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Selisih Susut
                            </th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 text-right font-semibold">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9EEE9]">
                        {orders.data.map((order) => {
                            const shrinkPct = calculateShrinkagePercent(
                                order.total_estimated_kg,
                                order.weight_shrinkage_kg,
                            );
                            const highShrinkage = Math.abs(shrinkPct) > 2;

                            return (
                                <tr
                                    key={order.id}
                                    className="hover:bg-[#E9EEE9]/35"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/surat-jalan/${order.id}`}
                                            className="font-bold text-[#1C5143] hover:underline"
                                        >
                                            {order.spb_number}
                                        </Link>
                                        <div className="text-[11px] text-[#466059]">
                                            {order.truck?.plate_number} ·{' '}
                                            {order.truck?.driver_name}
                                        </div>
                                        {order.notes && (
                                            <div className="max-w-xs truncate text-[11px] text-[#5A6C68]">
                                                {order.notes}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-[#102B26]">
                                            {order.pks_mill?.name ?? '-'}
                                        </div>
                                        <div className="text-[11px] text-[#466059]">
                                            Tiket:{' '}
                                            {order.pks_ticket_number ??
                                                'Menunggu PKS'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">
                                        {order.total_sacks_loaded} Karung ·{' '}
                                        {formatKg(order.total_estimated_kg)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-[#102B26]">
                                            {formatKg(order.pks_net_weight_kg)}
                                        </div>
                                        <div className="text-[11px] text-[#466059]">
                                            Tiba:{' '}
                                            {formatDateTime(order.arrived_at)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.weight_shrinkage_kg === null ? (
                                            <span className="text-[#466059]">
                                                -
                                            </span>
                                        ) : (
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                    highShrinkage
                                                        ? 'bg-[#9E2A2B]/14 text-[#8C2323]'
                                                        : 'bg-[#1C5143]/12 text-[#1C5143]'
                                                }`}
                                            >
                                                {formatKg(
                                                    order.weight_shrinkage_kg,
                                                )}{' '}
                                                ({shrinkPct}%)
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            status={order.delivery_status}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {canWeigh &&
                                        order.pks_net_weight_kg === null ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onSelectOrder(order)
                                                }
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
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
