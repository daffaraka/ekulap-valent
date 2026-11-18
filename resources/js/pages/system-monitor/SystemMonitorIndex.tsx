import { router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { AuditActivityTable } from '@/pages/system-monitor/components/AuditActivityTable';
import { SystemErrorTranslatorList } from '@/pages/system-monitor/components/SystemErrorTranslatorList';
import { SystemHealthBanner } from '@/pages/system-monitor/components/SystemHealthBanner';
import type {
    AuditLogRecord,
    CategoryOption,
    MonitorFilters,
    SystemOverview,
    TranslatedIncident,
} from '@/pages/system-monitor/types';
import type { PaginatedData } from '@/types';

type SystemMonitorIndexProps = {
    overview: SystemOverview;
    incidents: TranslatedIncident[];
    auditLogs: PaginatedData<AuditLogRecord>;
    filters: MonitorFilters;
    categoryOptions: CategoryOption[];
};

export default function SystemMonitorIndex({
    overview,
    incidents,
    auditLogs,
    filters: initialFilters,
    categoryOptions,
}: SystemMonitorIndexProps) {
    const [filters, setFilters] = useState<MonitorFilters>(initialFilters);

    const updateFilter = (key: keyof MonitorFilters, value: string): void => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const buildQuery = (
        nextFilters: MonitorFilters,
    ): Record<string, string> => {
        const query: Record<string, string> = {};
        if (nextFilters.tab) {
            query.tab = nextFilters.tab;
        }
        if (nextFilters.category) {
            query.category = nextFilters.category;
        }
        if (nextFilters.severity) {
            query.severity = nextFilters.severity;
        }
        if (nextFilters.search) {
            query.search = nextFilters.search;
        }
        if (nextFilters.date_from) {
            query.date_from = nextFilters.date_from;
        }
        if (nextFilters.date_to) {
            query.date_to = nextFilters.date_to;
        }
        return query;
    };

    const switchTab = (tab: string): void => {
        const next = { ...filters, tab };
        setFilters(next);
        router.get('/system-monitor', buildQuery(next), {
            preserveState: true,
        });
    };

    const handleApply = (): void => {
        router.get('/system-monitor', buildQuery(filters), {
            preserveState: true,
        });
    };

    const handleReset = (): void => {
        const cleared: MonitorFilters = {
            tab: filters.tab,
            category: '',
            severity: '',
            search: '',
            date_from: '',
            date_to: '',
        };
        setFilters(cleared);
        router.get('/system-monitor', { tab: filters.tab });
    };

    const exportParams = new URLSearchParams(
        buildQuery({ ...filters, tab: '' }),
    ).toString();
    const exportHref = exportParams
        ? `/system-monitor/export?${exportParams}`
        : '/system-monitor/export';

    return (
        <AdminLayout
            title="Monitor Kesehatan & Keamanan Sistem"
            subtitle="Pantau kendala upload, error aplikasi, serta riwayat login dan aktivitas pengguna dalam bahasa yang mudah dipahami"
        >
            <div className="space-y-4">
                <SystemHealthBanner overview={overview} />

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => switchTab('incidents')}
                        className={`min-h-11 rounded-lg px-4 text-xs font-semibold transition ${
                            filters.tab === 'incidents'
                                ? 'bg-[#1C5143] text-white'
                                : 'border border-[#C8D4C8] bg-white text-[#102B26] hover:bg-[#F6F8F6]'
                        }`}
                    >
                        Error Aplikasi &amp; Gagal Upload ({incidents.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => switchTab('audit')}
                        className={`min-h-11 rounded-lg px-4 text-xs font-semibold transition ${
                            filters.tab === 'audit'
                                ? 'bg-[#1C5143] text-white'
                                : 'border border-[#C8D4C8] bg-white text-[#102B26] hover:bg-[#F6F8F6]'
                        }`}
                    >
                        Keamanan Login &amp; Aktivitas User ({auditLogs.total})
                    </button>
                </div>

                {filters.tab === 'incidents' ? (
                    <SystemErrorTranslatorList incidents={incidents} />
                ) : (
                    <AuditActivityTable
                        auditLogs={auditLogs}
                        filters={filters}
                        categoryOptions={categoryOptions}
                        onUpdateFilter={updateFilter}
                        onApply={handleApply}
                        onReset={handleReset}
                        exportHref={exportHref}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
