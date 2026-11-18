import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import { DatePickerInput } from '@/components/ekulap/DatePickerInput';
import type {
    AuditLogRecord,
    CategoryOption,
    MonitorFilters,
} from '@/pages/system-monitor/types';
import { formatDateTime } from '@/services/formatters';
import type { PaginatedData } from '@/types';

type AuditActivityTableProps = {
    auditLogs: PaginatedData<AuditLogRecord>;
    filters: MonitorFilters;
    categoryOptions: CategoryOption[];
    onUpdateFilter: (key: keyof MonitorFilters, value: string) => void;
    onApply: () => void;
    onReset: () => void;
    exportHref: string;
};

const severityBadge = (severity: string): string => {
    if (severity === 'danger') {
        return 'bg-red-100 text-red-800';
    }
    if (severity === 'warning') {
        return 'bg-amber-100 text-amber-800';
    }
    return 'bg-emerald-100 text-emerald-800';
};

const severityText = (severity: string): string => {
    if (severity === 'danger') {
        return 'Bahaya';
    }
    if (severity === 'warning') {
        return 'Perhatian';
    }
    return 'Normal';
};

const columns: DataTableColumn<AuditLogRecord>[] = [
    {
        key: 'created_at',
        header: 'Waktu',
        cellClassName: 'whitespace-nowrap text-[#5A6C68]',
        sortValue: (l) => l.created_at,
        render: (log) => formatDateTime(log.created_at),
    },
    {
        key: 'actor',
        header: 'Pengguna',
        cellClassName: 'whitespace-nowrap',
        sortValue: (l) => l.actor_name,
        render: (log) => (
            <>
                <div className="font-semibold text-[#102B26]">
                    {log.actor_name}
                </div>
                <div className="text-[11px] text-[#5A6C68]">
                    {log.actor_role ?? 'Tamu'}
                    {log.actor_username ? ` · ${log.actor_username}` : ''}
                </div>
            </>
        ),
    },
    {
        key: 'severity',
        header: 'Status',
        cellClassName: 'whitespace-nowrap',
        sortValue: (l) => l.severity,
        render: (log) => (
            <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${severityBadge(log.severity)}`}
            >
                {severityText(log.severity)}
            </span>
        ),
    },
    {
        key: 'message',
        header: 'Aktivitas (Bahasa Manusia)',
        sortValue: (l) => l.human_message,
        render: (log) => (
            <>
                <div className="text-[#102B26]">{log.human_message}</div>
                {log.ip_address && (
                    <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                        IP: {log.ip_address}
                    </div>
                )}
            </>
        ),
    },
];

export function AuditActivityTable({
    auditLogs,
    filters,
    categoryOptions,
    onUpdateFilter,
    onApply,
    onReset,
    exportHref,
}: AuditActivityTableProps) {
    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) =>
                            onUpdateFilter('search', e.target.value)
                        }
                        placeholder="Cari nama, NIK, atau aktivitas..."
                        className="min-h-11 rounded-md border border-[#C8D4C8] px-3 text-xs lg:col-span-2"
                    />
                    <select
                        value={filters.category}
                        onChange={(e) =>
                            onUpdateFilter('category', e.target.value)
                        }
                        className="min-h-11 rounded-md border border-[#C8D4C8] bg-white px-3 text-xs"
                    >
                        <option value="">Semua Kategori</option>
                        {categoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.severity}
                        onChange={(e) =>
                            onUpdateFilter('severity', e.target.value)
                        }
                        className="min-h-11 rounded-md border border-[#C8D4C8] bg-white px-3 text-xs"
                    >
                        <option value="">Semua Tingkat</option>
                        <option value="normal">Normal</option>
                        <option value="warning">Perlu Perhatian</option>
                        <option value="danger">Bahaya / Gagal Berulang</option>
                    </select>
                    <DatePickerInput
                        value={filters.date_from}
                        onChange={(val) => onUpdateFilter('date_from', val)}
                        placeholder="Dari tanggal"
                    />
                    <DatePickerInput
                        value={filters.date_to}
                        onChange={(val) => onUpdateFilter('date_to', val)}
                        placeholder="Sampai tanggal"
                    />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onApply}
                            className="min-h-10 rounded-md bg-[#1C5143] px-4 text-xs font-semibold text-white hover:bg-[#102B26]"
                        >
                            Terapkan Filter
                        </button>
                        <button
                            type="button"
                            onClick={onReset}
                            className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs font-medium text-[#102B26] hover:bg-[#F6F8F6]"
                        >
                            Reset
                        </button>
                    </div>
                    <a
                        href={exportHref}
                        className="inline-flex min-h-10 items-center rounded-md border border-[#1C5143] px-3 text-xs font-semibold text-[#1C5143] hover:bg-[#E8F1EC]"
                    >
                        Ekspor Audit CSV
                    </a>
                </div>
            </div>

            <DataTable
                data={auditLogs.data}
                columns={columns}
                getRowKey={(l) => l.id}
                searchableText={(l) =>
                    `${l.actor_name} ${l.actor_username ?? ''} ${l.actor_role ?? ''} ${l.human_message}`
                }
                searchPlaceholder="Saring cepat di halaman ini..."
                emptyMessage="Belum ada catatan aktivitas yang cocok dengan filter."
                serverPagination={{
                    current_page: auditLogs.current_page,
                    last_page: auditLogs.last_page,
                    total: auditLogs.total,
                    links: auditLogs.links,
                }}
            />
        </div>
    );
}
