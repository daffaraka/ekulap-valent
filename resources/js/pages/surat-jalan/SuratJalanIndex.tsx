import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { SuratJalanBuilderModal } from '@/pages/surat-jalan/components/SuratJalanBuilderModal';
import { SuratJalanTable } from '@/pages/surat-jalan/components/SuratJalanTable';
import type {
    AvailableLotOption,
    DeliveryOrder,
    Division,
    PaginatedData,
    PksMill,
    Truck,
    User,
} from '@/types';

type SuratJalanIndexProps = {
    orders: PaginatedData<DeliveryOrder>;
    availableLots: AvailableLotOption[];
    filters: { status: string; search: string };
    divisions: Division[];
    trucks: Truck[];
    pksMills: PksMill[];
    deliveryStatuses: string[];
};

export default function SuratJalanIndex({
    orders,
    availableLots,
    filters,
    divisions,
    trucks,
    pksMills,
    deliveryStatuses,
}: SuratJalanIndexProps) {
    const page = usePage<{ auth: { user: User } }>();
    const role = page.props.auth.user.role;
    const canCreate =
        role === 'Admin' ||
        role === 'Kerani Produksi' ||
        role === 'Supervisi/Asisten';
    const canDispatch = canCreate || role === 'Supir';

    const [search, setSearch] = useState<string>(filters.search);
    const [status, setStatus] = useState<string>(filters.status);
    const [builderOpen, setBuilderOpen] = useState<boolean>(false);

    const applyFilter = (nextStatus = status): void => {
        router.get(
            '/surat-jalan',
            {
                ...(search ? { search } : {}),
                ...(nextStatus ? { status: nextStatus } : {}),
            },
            { preserveState: true },
        );
    };

    return (
        <AdminLayout
            title="Surat Jalan & Muat Truk (SPB)"
            subtitle="Pengangkutan karung dari TPH ke truk dengan keterangan tujuan & dokumentasi foto pengangkutan"
        >
            <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap gap-2.5">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    applyFilter();
                                }
                            }}
                            placeholder="Cari Nomor SPB..."
                            className="min-h-11 flex-1 rounded-md border border-[#C8D4C8] bg-[#E9EEE9]/45 px-3 text-xs sm:max-w-xs"
                        />
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                applyFilter(e.target.value);
                            }}
                            className="h-11 rounded-md border border-[#C8D4C8] bg-white px-3 py-2 text-xs font-medium"
                        >
                            <option value="">Semua Status SPB</option>
                            {deliveryStatuses.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => applyFilter()}
                            className="min-h-11 rounded-md border border-[#CFD9CF] bg-[#E9EEE9] px-4 text-xs font-bold"
                        >
                            Cari
                        </button>
                    </div>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => setBuilderOpen(true)}
                            className="min-h-11 rounded-md bg-[#1C5143] px-4 text-xs font-bold text-white transition hover:bg-[#102B26]"
                        >
                            + Buat SPB &amp; Muat Truk ({availableLots.length}{' '}
                            Lot Sisa)
                        </button>
                    )}
                </div>

                <SuratJalanTable orders={orders} canDispatch={canDispatch} />

                <SuratJalanBuilderModal
                    open={builderOpen}
                    divisions={divisions}
                    trucks={trucks}
                    pksMills={pksMills}
                    availableLots={availableLots}
                    onClose={() => setBuilderOpen(false)}
                />
            </div>
        </AdminLayout>
    );
}
