import { BrandLogo } from '@/components/ekulap/BrandLogo';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import { SuratJalanPrintItemsTable } from '@/pages/surat-jalan/components/SuratJalanPrintItemsTable';
import { formatDateTime, formatKg } from '@/services/formatters';
import type { DeliveryOrder } from '@/types';

type SuratJalanPrintSheetProps = {
    order: DeliveryOrder;
};

export function SuratJalanPrintSheet({ order }: SuratJalanPrintSheetProps) {
    const loadingPhotos = order.loading_photo_paths ?? [];

    return (
        <div className="rounded-lg border border-[#102B26]/10 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#CFD9CF] pb-4">
                <BrandLogo variant="light" />
                <div className="text-right">
                    <div className="text-xs font-semibold tracking-wider text-[#466059] uppercase">
                        Surat Pengantar Buah (SPB Digital)
                    </div>
                    <div className="text-xl font-bold text-[#102B26]">
                        {order.spb_number}
                    </div>
                    <div className="mt-1">
                        <StatusBadge status={order.delivery_status} />
                    </div>
                </div>
            </div>

            <div className="mt-5 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-md bg-[#E9EEE9]/50 p-3">
                    <div className="text-[#466059]">Divisi Asal</div>
                    <div className="mt-0.5 font-bold text-[#102B26]">
                        {order.division?.code} — {order.division?.name}
                    </div>
                </div>
                <div className="rounded-md bg-[#E9EEE9]/50 p-3">
                    <div className="text-[#466059]">Truk &amp; Supir</div>
                    <div className="mt-0.5 font-bold text-[#102B26]">
                        {order.truck?.plate_number} · {order.truck?.driver_name}
                    </div>
                </div>
                <div className="rounded-md bg-[#E9EEE9]/50 p-3">
                    <div className="text-[#466059]">PKS Tujuan</div>
                    <div className="mt-0.5 font-bold text-[#102B26]">
                        {order.pks_mill?.name} ({order.pks_mill?.code})
                    </div>
                </div>
                <div className="rounded-md bg-[#E9EEE9]/50 p-3">
                    <div className="text-[#466059]">
                        Petugas Muat &amp; Jam Kirim
                    </div>
                    <div className="mt-0.5 font-bold text-[#102B26]">
                        {order.loader?.name} ·{' '}
                        {formatDateTime(order.departed_at)}
                    </div>
                </div>
            </div>

            {order.notes && (
                <div className="mt-4 rounded-md border border-[#1C5143]/20 bg-[#F6F8F6] px-4 py-2.5 text-xs">
                    <span className="font-semibold text-[#5A6C68]">
                        Keterangan Tujuan SPB:{' '}
                    </span>
                    <span className="font-semibold text-[#102B26]">
                        {order.notes}
                    </span>
                </div>
            )}

            <SuratJalanPrintItemsTable
                items={order.items ?? []}
                totalSacksLoaded={order.total_sacks_loaded}
                totalEstimatedKg={order.total_estimated_kg}
            />

            {loadingPhotos.length > 0 && (
                <div className="mt-5">
                    <h4 className="mb-2 text-xs font-bold tracking-wide text-[#1C5143] uppercase">
                        Dokumentasi Foto Pengangkutan SPB (
                        {loadingPhotos.length} Foto)
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {loadingPhotos.map((path, index) => (
                            <a
                                key={`${path}-${index}`}
                                href={`/storage/${path}`}
                                target="_blank"
                                rel="noreferrer"
                                className="overflow-hidden rounded-md border border-[#CFD9CF] bg-[#F6F8F6]"
                            >
                                <img
                                    src={`/storage/${path}`}
                                    alt={`Foto pengangkutan ${order.spb_number} #${index + 1}`}
                                    className="h-44 w-full object-cover"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {order.pks_net_weight_kg !== null && (
                <div className="mt-5 grid gap-3 rounded-md border border-[#1C5143]/30 bg-[#E9EEE9]/55 p-4 text-xs sm:grid-cols-4">
                    <div>
                        <span className="text-[#466059]">Nomor Tiket PKS</span>
                        <div className="font-bold text-[#102B26]">
                            {order.pks_ticket_number}
                        </div>
                    </div>
                    <div>
                        <span className="text-[#466059]">Berat Netto PKS</span>
                        <div className="font-bold text-[#1C5143]">
                            {formatKg(order.pks_net_weight_kg)}
                        </div>
                    </div>
                    <div>
                        <span className="text-[#466059]">Selisih / Susut</span>
                        <div className="font-bold text-[#8C2323]">
                            {formatKg(order.weight_shrinkage_kg)}
                        </div>
                    </div>
                    <div>
                        <span className="text-[#466059]">Jam Tiba PKS</span>
                        <div className="font-bold text-[#102B26]">
                            {formatDateTime(order.arrived_at)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
