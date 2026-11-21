import { router } from '@inertiajs/react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { RekapanDailyTable } from '@/pages/rekapan/components/RekapanDailyTable';
import { RekapanDetailModal } from '@/pages/rekapan/components/RekapanDetailModal';
import { RekapanFilterBar } from '@/pages/rekapan/components/RekapanFilterBar';
import { RekapanStationModal } from '@/pages/rekapan/components/RekapanStationModal';
import { RekapanStationTable } from '@/pages/rekapan/components/RekapanStationTable';
import type {
    RekapanDailyRow,
    RekapanFilters,
    RekapanStationRow,
    RekapanTotals,
} from '@/pages/rekapan/types';
import { formatKg, formatNumber } from '@/services/formatters';
import type { Division } from '@/types';

type RekapanIndexProps = {
    dailyRows: RekapanDailyRow[];
    stationRows: RekapanStationRow[];
    totals: RekapanTotals;
    filters: RekapanFilters;
    divisions: Division[];
};

export default function RekapanIndex({
    dailyRows,
    stationRows,
    totals,
    filters,
    divisions,
}: RekapanIndexProps) {
    const { can } = usePermissions();
    const canExport = can('rekapan.export');
    const [activeTab, setActiveTab] = useState(filters.tab || 'daily');
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [divisionId, setDivisionId] = useState(
        filters.division_id ? String(filters.division_id) : '',
    );
    const [selectedRow, setSelectedRow] = useState<RekapanDailyRow | null>(
        null,
    );
    const [selectedStation, setSelectedStation] =
        useState<RekapanStationRow | null>(null);

    const buildQuery = (
        tabValue: string = activeTab,
    ): Record<string, string> => {
        const query: Record<string, string> = { tab: tabValue };
        if (dateFrom) {
            query.date_from = dateFrom;
        }
        if (dateTo) {
            query.date_to = dateTo;
        }
        if (divisionId) {
            query.division_id = divisionId;
        }
        return query;
    };

    const switchTab = (nextTab: string): void => {
        setActiveTab(nextTab);
        router.get('/rekapan-kutip-lapis', buildQuery(nextTab), {
            preserveState: true,
        });
    };

    const handleApply = (): void => {
        router.get('/rekapan-kutip-lapis', buildQuery(), {
            preserveState: true,
        });
    };

    const handleReset = (): void => {
        setDateFrom('');
        setDateTo('');
        setDivisionId('');
        router.get('/rekapan-kutip-lapis', { tab: activeTab });
    };

    const exportParams = new URLSearchParams(buildQuery()).toString();
    const exportHref = `/rekapan-kutip-lapis/export?${exportParams}`;

    return (
        <AdminLayout
            title="Rekapan Hasil Kutip Lapis"
            subtitle="Pantau rekapan panen per tanggal serta umur hari restan pada setiap stasiun (TPH)"
        >
            <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                        <div className="text-xs text-[#5A6C68]">
                            Total Hasil Kutip Lapis
                        </div>
                        <div className="mt-1 text-xl font-semibold text-[#1C5143]">
                            {formatNumber(totals.total_sacks)} Karung
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                            {formatKg(totals.total_net_kg)} ·{' '}
                            {formatNumber(totals.days_count)} Hari Panen
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                        <div className="text-xs text-[#5A6C68]">
                            Sisa Restan Belum Berangkat
                        </div>
                        <div className="mt-1 text-xl font-semibold text-[#B97B16]">
                            {formatNumber(totals.remaining_sacks)} Karung
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                            Tersebar di{' '}
                            {formatNumber(totals.pending_station_count)} Stasiun
                            TPH
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                        <div className="text-xs text-[#5A6C68]">
                            Restan Terlama
                        </div>
                        <div className="mt-1 text-xl font-semibold text-[#8C2323]">
                            {formatNumber(totals.max_restan_days)} Hari
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                            Akumulatif{' '}
                            {formatNumber(totals.cumulative_restan_days)} Hari
                        </div>
                    </div>
                    <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                        <div className="text-xs text-[#5A6C68]">
                            Termuat / SPB Belum Muat
                        </div>
                        <div className="mt-1 text-xl font-semibold text-[#102B26]">
                            {formatNumber(totals.loaded_sacks)} Karung
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                            Menunggu di SPB Belum Muat:{' '}
                            {formatNumber(totals.belum_muat_spb_sacks)} Karung
                        </div>
                    </div>
                </div>

                <RekapanFilterBar
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    divisionId={divisionId}
                    divisions={divisions}
                    exportHref={canExport ? exportHref : undefined}
                    exportLabel={
                        activeTab === 'station'
                            ? 'Ekspor CSV Stasiun'
                            : 'Ekspor CSV Harian'
                    }
                    onChangeDateFrom={setDateFrom}
                    onChangeDateTo={setDateTo}
                    onChangeDivisionId={setDivisionId}
                    onApply={handleApply}
                    onReset={handleReset}
                />

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => switchTab('daily')}
                        className={`min-h-11 rounded-lg px-4 text-xs font-semibold transition ${
                            activeTab === 'daily'
                                ? 'bg-[#1C5143] text-white'
                                : 'border border-[#C8D4C8] bg-white text-[#102B26] hover:bg-[#F6F8F6]'
                        }`}
                    >
                        Rekap per Tanggal ({dailyRows.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => switchTab('station')}
                        className={`min-h-11 rounded-lg px-4 text-xs font-semibold transition ${
                            activeTab === 'station'
                                ? 'bg-[#1C5143] text-white'
                                : 'border border-[#C8D4C8] bg-white text-[#102B26] hover:bg-[#F6F8F6]'
                        }`}
                    >
                        Restan per Stasiun / TPH ({stationRows.length})
                    </button>
                </div>

                {activeTab === 'station' ? (
                    <RekapanStationTable
                        rows={stationRows}
                        onSelectStation={setSelectedStation}
                    />
                ) : (
                    <RekapanDailyTable
                        rows={dailyRows}
                        onSelectDate={setSelectedRow}
                    />
                )}

                <RekapanDetailModal
                    row={selectedRow}
                    onClose={() => setSelectedRow(null)}
                />
                <RekapanStationModal
                    station={selectedStation}
                    onClose={() => setSelectedStation(null)}
                />
            </div>
        </AdminLayout>
    );
}
