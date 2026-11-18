import { useState } from 'react';
import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import type { TranslatedIncident } from '@/pages/system-monitor/types';

type SystemErrorTranslatorListProps = {
    incidents: TranslatedIncident[];
};

export function SystemErrorTranslatorList({
    incidents,
}: SystemErrorTranslatorListProps) {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleDetail = (id: string): void => {
        setExpandedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const columns: DataTableColumn<TranslatedIncident>[] = [
        {
            key: 'occurred_at',
            header: 'Waktu',
            cellClassName: 'whitespace-nowrap text-[#5A6C68]',
            sortValue: (i) => i.occurred_at,
            render: (item) => item.occurred_human,
        },
        {
            key: 'severity',
            header: 'Tingkat',
            cellClassName: 'whitespace-nowrap',
            sortValue: (i) => i.severity_label,
            render: (item) => {
                const badgeTone =
                    item.severity === 'danger'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800';
                return (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeTone}`}
                    >
                        {item.severity_label}
                    </span>
                );
            },
        },
        {
            key: 'title',
            header: 'Masalah & Penjelasan (Bahasa Manusia)',
            cellClassName: 'min-w-64',
            sortValue: (i) => i.title,
            render: (item) => (
                <>
                    <div className="font-semibold text-[#102B26]">
                        {item.title}
                    </div>
                    <p className="mt-0.5 leading-relaxed text-[#5A6C68]">
                        {item.human_summary}
                    </p>
                </>
            ),
        },
        {
            key: 'action',
            header: 'Saran Tindakan',
            cellClassName: 'min-w-60 leading-relaxed text-[#1C5143]',
            render: (item) => item.recommended_action,
        },
        {
            key: 'detail',
            header: 'Detail IT',
            align: 'right',
            cellClassName: 'whitespace-nowrap',
            render: (item) => {
                const isOpen = expandedIds.includes(item.id);
                return (
                    <button
                        type="button"
                        onClick={() => toggleDetail(item.id)}
                        className="min-h-9 rounded-md border border-[#C8D4C8] px-2.5 text-[11px] font-medium text-[#102B26] hover:bg-[#F6F8F6]"
                    >
                        {isOpen ? 'Tutup Info IT' : 'Info Teknis IT'}
                    </button>
                );
            },
        },
    ];

    return (
        <DataTable
            data={incidents}
            columns={columns}
            getRowKey={(i) => i.id}
            searchableText={(i) =>
                `${i.occurred_human} ${i.severity_label} ${i.title} ${i.human_summary} ${i.recommended_action}`
            }
            searchPlaceholder="Cari jenis kendala / waktu..."
            emptyMessage="Tidak ada catatan error sistem maupun gagal upload. Semua proses berjalan normal."
            isRowExpanded={(i) => expandedIds.includes(i.id)}
            renderExpandedRow={(item) => (
                <pre className="overflow-x-auto rounded-md bg-[#102B26] p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-[#E9EEE9]">
                    {item.technical_detail}
                </pre>
            )}
        />
    );
}
