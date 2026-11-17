import { formatDateTime, formatKg } from '@/services/formatters';
import type { DeliveryOrderItem } from '@/types';

type SuratJalanPrintItemsTableProps = {
    items: DeliveryOrderItem[];
    totalSacksLoaded: number;
    totalEstimatedKg: number;
};

function resolveItemWorkers(item: DeliveryOrderItem): string {
    const workers = item.harvest_record?.workers;
    if (workers && workers.length > 0) {
        return workers.map((w) => w.name).join(', ');
    }
    return item.harvest_record?.worker?.name ?? '-';
}

export function SuratJalanPrintItemsTable({
    items,
    totalSacksLoaded,
    totalEstimatedKg,
}: SuratJalanPrintItemsTableProps) {
    return (
        <div className="mt-6 overflow-x-auto">
            <h3 className="mb-2 text-xs font-bold tracking-wide text-[#1C5143] uppercase">
                Rincian Muatan per Truk (Isi Surat Jalan)
            </h3>
            <table className="w-full text-left text-xs">
                <thead className="border-b border-[#102B26]/12 bg-[#E9EEE9]/70 text-[#5A6C68]">
                    <tr>
                        <th className="px-3 py-2.5 font-semibold">
                            Nomor Lot TPH
                        </th>
                        <th className="px-3 py-2.5 font-semibold">
                            Titik TPH &amp; Blok
                        </th>
                        <th className="px-3 py-2.5 font-semibold">
                            Tenaga Kerja
                        </th>
                        <th className="px-3 py-2.5 font-semibold">
                            Karung Dinaikkan
                        </th>
                        <th className="px-3 py-2.5 font-semibold">
                            Estimasi Berat (Kg)
                        </th>
                        <th className="px-3 py-2.5 font-semibold">
                            Jam Naik Truk
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EEE9]">
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td className="px-3 py-2.5 font-bold text-[#102B26]">
                                {item.harvest_record?.lot_number ?? '-'}
                            </td>
                            <td className="px-3 py-2.5">
                                {item.harvest_record?.tph_point?.code ?? '-'}{' '}
                                (Blok {item.harvest_record?.block?.code ?? '-'})
                            </td>
                            <td className="px-3 py-2.5">
                                {resolveItemWorkers(item)}
                            </td>
                            <td className="px-3 py-2.5 font-bold text-[#1C5143]">
                                {item.loaded_sacks} Karung
                            </td>
                            <td className="px-3 py-2.5 font-semibold">
                                {formatKg(item.estimated_weight_kg)}
                            </td>
                            <td className="px-3 py-2.5 text-[#466059]">
                                {formatDateTime(item.loaded_at)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="border-t-2 border-[#102B26] bg-[#E9EEE9]/60 font-bold">
                    <tr>
                        <td colSpan={3} className="px-3 py-2.5 text-right">
                            Total Muatan Surat Jalan
                        </td>
                        <td className="px-3 py-2.5 text-[#1C5143]">
                            {totalSacksLoaded} Karung
                        </td>
                        <td colSpan={2} className="px-3 py-2.5 text-[#102B26]">
                            {formatKg(totalEstimatedKg)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
