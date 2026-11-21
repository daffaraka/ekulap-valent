import { Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { SpbDispatchModal } from '@/pages/surat-jalan/components/SpbDispatchModal';
import { SuratJalanPrintSheet } from '@/pages/surat-jalan/components/SuratJalanPrintSheet';
import type { AvailableLotOption, DeliveryOrder } from '@/types';

type SuratJalanDetailProps = {
    order: DeliveryOrder;
    availableLots: AvailableLotOption[];
};

export default function SuratJalanDetail({
    order,
    availableLots,
}: SuratJalanDetailProps) {
    const { can } = usePermissions();
    const canModify = can('surat-jalan.create');
    const canDispatch = can('surat-jalan.dispatch');

    const [selectedLotId, setSelectedLotId] = useState<string>(
        availableLots[0] ? String(availableLots[0].id) : '',
    );
    const [loadedSacks, setLoadedSacks] = useState<number>(
        availableLots[0]?.remaining_sacks ?? 1,
    );
    const [dispatchModalOpen, setDispatchModalOpen] = useState<boolean>(false);

    const handleAddItem = (event: FormEvent): void => {
        event.preventDefault();
        if (!selectedLotId) {
            return;
        }
        router.post(`/surat-jalan/${order.id}/items`, {
            items: [
                {
                    tph_harvest_record_id: Number(selectedLotId),
                    loaded_sacks: loadedSacks,
                },
            ],
        });
    };

    return (
        <AdminLayout
            title={`Detail Surat Jalan ${order.spb_number}`}
            subtitle="Dokumen muatan truk (SPB) berlogo resmi Sinarmas siap cetak"
        >
            <div className="space-y-4">
                <div className="no-print flex flex-wrap items-center justify-between gap-2">
                    <Link
                        href="/surat-jalan"
                        className="inline-flex min-h-10 items-center rounded-md border border-[#CFD9CF] bg-white px-4 text-xs font-semibold text-[#102B26]"
                    >
                        ← Kembali ke Daftar SPB
                    </Link>

                    <div className="flex flex-wrap gap-2">
                        {canDispatch &&
                            order.delivery_status === 'Belum Muat' && (
                                <button
                                    type="button"
                                    onClick={() => setDispatchModalOpen(true)}
                                    className="min-h-10 rounded-md bg-[#D6A84F] px-4 text-xs font-bold text-[#102B26]"
                                >
                                    Kirim SPB (Sudah Dikirim)
                                </button>
                            )}
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="min-h-10 rounded-md bg-[#1C5143] px-4 text-xs font-bold text-white"
                        >
                            Cetak Surat Jalan (PDF/Print)
                        </button>
                    </div>
                </div>

                <SuratJalanPrintSheet order={order} />

                {canModify &&
                    order.pks_net_weight_kg === null &&
                    availableLots.length > 0 && (
                        <form
                            onSubmit={handleAddItem}
                            className="no-print flex flex-wrap items-end gap-3 rounded-lg border border-[#CFD9CF] bg-white p-4 shadow-xs"
                        >
                            <div className="min-w-56 flex-1">
                                <label className="mb-1 block text-xs font-semibold">
                                    Tambah Muatan dari Stasiun TPH Tersisa
                                </label>
                                <select
                                    value={selectedLotId}
                                    onChange={(e) => {
                                        const id = e.target.value;
                                        setSelectedLotId(id);
                                        const found = availableLots.find(
                                            (l) => String(l.id) === id,
                                        );
                                        if (found) {
                                            setLoadedSacks(
                                                found.remaining_sacks,
                                            );
                                        }
                                    }}
                                    className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                                >
                                    {availableLots.map((lot) => (
                                        <option key={lot.id} value={lot.id}>
                                            {lot.lot_number} ({lot.tph_code} ·{' '}
                                            {lot.worker_name}) — Sisa{' '}
                                            {lot.remaining_sacks} Karung
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-32">
                                <label className="mb-1 block text-xs font-semibold">
                                    Karung Naik
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={loadedSacks}
                                    onChange={(e) =>
                                        setLoadedSacks(Number(e.target.value))
                                    }
                                    className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs font-bold"
                                />
                            </div>
                            <button
                                type="submit"
                                className="min-h-10 rounded-md bg-[#1C5143] px-4 text-xs font-bold text-white"
                            >
                                + Muat ke SPB Ini
                            </button>
                        </form>
                    )}

                <SpbDispatchModal
                    key={order.id}
                    order={dispatchModalOpen ? order : null}
                    onClose={() => setDispatchModalOpen(false)}
                />
            </div>
        </AdminLayout>
    );
}
