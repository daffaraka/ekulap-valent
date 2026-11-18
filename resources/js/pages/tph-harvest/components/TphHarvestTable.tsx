import { router } from '@inertiajs/react';
import { useState } from 'react';
import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import { TphPhotoPreviewModal } from '@/pages/tph-harvest/components/TphPhotoPreviewModal';
import {
    formatDateOnly,
    formatDateTime,
    formatKg,
} from '@/services/formatters';
import type { PaginatedData, TphHarvestRecord } from '@/types';

type TphHarvestTableProps = {
    records: PaginatedData<TphHarvestRecord>;
    canDelete: boolean;
};

const getWorkerNames = (record: TphHarvestRecord): string =>
    record.workers && record.workers.length > 0
        ? record.workers.map((w) => w.name).join(', ')
        : (record.worker?.name ?? '-');

const getPhotoCount = (record: TphHarvestRecord): number =>
    record.photo_paths && record.photo_paths.length > 0
        ? record.photo_paths.length
        : record.photo_path
          ? 1
          : 0;

export function getTphHarvestRowClass(status: string): string {
    if (status === 'Sudah Diangkut' || status === 'Sudah Masuk PKS') {
        return 'bg-emerald-50/85 hover:bg-emerald-100/75 transition-colors';
    }
    if (status === 'Diangkut Sebagian') {
        return 'bg-yellow-50/90 hover:bg-yellow-100/75 transition-colors';
    }
    return '';
}

function TphGpsPhotoCell({
    record,
    onPreview,
}: {
    record: TphHarvestRecord;
    onPreview: (record: TphHarvestRecord) => void;
}) {
    const isFar =
        record.gps_distance_meters !== null && record.gps_distance_meters > 100;
    const photoCount = getPhotoCount(record);

    return (
        <div className="flex flex-col items-start gap-1">
            {record.gps_distance_meters === null ? (
                <span className="text-[#466059]">-</span>
            ) : (
                <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isFar
                            ? 'bg-[#9E2A2B]/12 text-[#8C2323]'
                            : 'bg-[#1C5143]/12 text-[#1C5143]'
                    }`}
                >
                    {record.gps_distance_meters} m{' '}
                    {isFar ? '(Menyimpang)' : '(Valid)'}
                </span>
            )}
            {photoCount > 0 && (
                <button
                    type="button"
                    onClick={() => onPreview(record)}
                    className="rounded border border-[#CFD9CF] bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#1C5143] hover:bg-[#E9EEE9]"
                >
                    Lihat {photoCount} Foto
                </button>
            )}
        </div>
    );
}

function TphTransportStatusCell({ record }: { record: TphHarvestRecord }) {
    const pct =
        record.sack_count > 0
            ? Math.round((record.loaded_sack_count / record.sack_count) * 100)
            : 0;
    const barColor =
        record.transport_status === 'Diangkut Sebagian'
            ? 'bg-amber-500'
            : 'bg-[#1C5143]';

    return (
        <>
            <StatusBadge status={record.transport_status} />
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#466059]">
                <span>
                    {record.loaded_sack_count}/{record.sack_count} Karung
                </span>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#DFE6DF]">
                    <div
                        className={`h-full ${barColor}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </>
    );
}

function buildTphHarvestColumns(
    canDelete: boolean,
    onPreview: (record: TphHarvestRecord) => void,
    onDelete: (record: TphHarvestRecord) => void,
): DataTableColumn<TphHarvestRecord>[] {
    const columns: DataTableColumn<TphHarvestRecord>[] = [
        {
            key: 'lot',
            header: 'No. Lot & Tgl',
            sortValue: (r) => `${r.work_date} ${r.lot_number}`,
            render: (r) => (
                <>
                    <div className="font-bold text-[#102B26]">
                        {r.lot_number}
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        {formatDateOnly(r.work_date)}
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        Timbang: {formatDateTime(r.weighed_at)}
                    </div>
                </>
            ),
        },
        {
            key: 'location',
            header: 'Divisi / Blok / TPH',
            sortValue: (r) =>
                `${r.block?.code ?? ''} ${r.tph_point?.code ?? ''}`,
            render: (r) => (
                <>
                    <div className="font-bold text-[#1C5143]">
                        Blok {r.block?.code ?? '-'} · {r.tph_point?.code ?? '-'}
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        {r.division?.code}
                    </div>
                </>
            ),
        },
        {
            key: 'workers',
            header: 'Tenaga Kerja & Kerani',
            sortValue: (r) => getWorkerNames(r),
            render: (r) => (
                <>
                    <div className="font-semibold text-[#102B26]">
                        {getWorkerNames(r)} ({r.harvest_type})
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        Petugas: {r.weigher?.name ?? r.recorder?.name ?? '-'}
                    </div>
                </>
            ),
        },
        {
            key: 'weight',
            header: 'Karung, Jml TPH & Berat',
            sortValue: (r) => r.net_weight_kg,
            render: (r) => (
                <>
                    <div className="font-bold text-[#102B26]">
                        {r.sack_count} Karung · {formatKg(r.net_weight_kg)}
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        Jumlah TPH: {r.tph_count ?? 1} TPH
                    </div>
                </>
            ),
        },
        {
            key: 'gps',
            header: 'Validasi GPS & Foto',
            sortValue: (r) => r.gps_distance_meters ?? 99999,
            render: (r) => <TphGpsPhotoCell record={r} onPreview={onPreview} />,
        },
        {
            key: 'status',
            header: 'Status & Progres Naik',
            sortValue: (r) => r.transport_status,
            render: (r) => <TphTransportStatusCell record={r} />,
        },
    ];

    if (canDelete) {
        columns.push({
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (r) =>
                r.loaded_sack_count === 0 ? (
                    <button
                        type="button"
                        onClick={() => onDelete(r)}
                        className="rounded-lg border border-[#9E2A2B]/30 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#8C2323] hover:bg-[#9E2A2B]/10"
                    >
                        Hapus
                    </button>
                ) : (
                    <span className="text-[11px] text-[#466059]">Terkunci</span>
                ),
        });
    }

    return columns;
}

export function TphHarvestTable({ records, canDelete }: TphHarvestTableProps) {
    const [previewRecord, setPreviewRecord] = useState<TphHarvestRecord | null>(
        null,
    );

    const handleDelete = (record: TphHarvestRecord): void => {
        if (record.loaded_sack_count === 0) {
            router.delete(`/tph-harvest/${record.id}`, {
                preserveScroll: true,
            });
        }
    };

    const columns = buildTphHarvestColumns(
        canDelete,
        setPreviewRecord,
        handleDelete,
    );

    return (
        <>
            <DataTable
                data={records.data}
                columns={columns}
                getRowKey={(r) => r.id}
                rowClassName={(r) => getTphHarvestRowClass(r.transport_status)}
                searchableText={(r) =>
                    `${r.lot_number} ${r.block?.code ?? ''} ${r.tph_point?.code ?? ''} ${getWorkerNames(r)} ${r.transport_status}`
                }
                searchPlaceholder="Cari lot / blok / TPH / pekerja..."
                emptyMessage="Belum ada catatan Timbang TPH."
                serverPagination={{
                    current_page: records.current_page,
                    last_page: records.last_page,
                    total: records.total,
                    links: records.links,
                }}
            />
            <TphPhotoPreviewModal
                record={previewRecord}
                onClose={() => setPreviewRecord(null)}
            />
        </>
    );
}
