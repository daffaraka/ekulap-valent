import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AiAlertStrip } from '@/pages/dashboard/components/AiAlertStrip';
import { DashboardChartsRow } from '@/pages/dashboard/components/DashboardChartsRow';
import type { StatusBreakdownItem } from '@/pages/dashboard/components/FlowPipelineBanner';
import {
    type DashboardKpis,
    KpiSummaryGrid,
} from '@/pages/dashboard/components/KpiSummaryGrid';
import { RecentActivityTables } from '@/pages/dashboard/components/RecentActivityTables';
import type {
    AiSnapshot,
    DeliveryOrder,
    Division,
    TphHarvestRecord,
} from '@/types';

type DashboardOverviewProps = {
    filters: { division_id: number | null };
    divisions: Division[];
    kpis: DashboardKpis;
    statusBreakdown: StatusBreakdownItem[];
    chartTotalSacks: number;
    recentHarvests: TphHarvestRecord[];
    recentDeliveries: DeliveryOrder[];
    aiSnapshot: AiSnapshot;
};

export default function DashboardOverview({
    filters,
    divisions,
    kpis,
    statusBreakdown,
    chartTotalSacks,
    recentHarvests,
    recentDeliveries,
    aiSnapshot,
}: DashboardOverviewProps) {
    const page = usePage();
    const basePath = page.url.startsWith('/dashboard') ? '/dashboard' : '/';

    const handleDivisionFilter = (value: string): void => {
        router.get(basePath, value ? { division_id: value } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout
            title="Dashboard Monitoring TPH – PKS"
            subtitle="Pantauan panen karung, Kg, armada truk SPB, & restan belum diangkut"
        >
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                    <div>
                        <div className="text-xs font-semibold text-[#102B26]">
                            Filter Data per Divisi / Afdeling
                        </div>
                        <div className="text-[11px] text-[#5A6C68]">
                            Pilih divisi untuk memfilter ringkasan KPI, grafik
                            karung, dan aktivitas terbaru.
                        </div>
                    </div>

                    <select
                        value={filters.division_id ?? ''}
                        onChange={(e) => handleDivisionFilter(e.target.value)}
                        aria-label="Filter per divisi"
                        className="h-11 min-w-56 rounded-md border border-[#102B26]/14 bg-[#F6F8F6] px-3 py-2 text-xs font-medium text-[#102B26]"
                    >
                        <option value="">Semua Divisi / Afdeling</option>
                        {divisions.map((div) => (
                            <option key={div.id} value={div.id}>
                                {div.code} — {div.name}
                            </option>
                        ))}
                    </select>
                </div>

                <KpiSummaryGrid kpis={kpis} />

                <DashboardChartsRow
                    breakdown={statusBreakdown}
                    totalSacks={chartTotalSacks}
                />

                <AiAlertStrip aiSnapshot={aiSnapshot} />

                <RecentActivityTables
                    recentHarvests={recentHarvests}
                    recentDeliveries={recentDeliveries}
                />
            </div>
        </AdminLayout>
    );
}
