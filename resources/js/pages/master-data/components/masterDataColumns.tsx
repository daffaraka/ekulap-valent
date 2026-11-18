import { router } from '@inertiajs/react';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import { formatKg } from '@/services/formatters';
import type {
    Block,
    Division,
    PksMill,
    TphPoint,
    Truck,
    Worker,
} from '@/types';

const deleteBtn = (url: string) => (
    <button
        type="button"
        onClick={() => router.delete(url)}
        className="text-[11px] font-semibold text-[#8C2323] hover:underline"
    >
        Hapus
    </button>
);

export function buildDivisionColumns(
    canModify: boolean,
): DataTableColumn<Division>[] {
    const cols: DataTableColumn<Division>[] = [
        {
            key: 'code',
            header: 'Kode Divisi',
            cellClassName: 'font-bold',
            sortValue: (d) => d.code,
            render: (d) => d.code,
        },
        {
            key: 'name',
            header: 'Nama Divisi',
            sortValue: (d) => d.name,
            render: (d) => d.name,
        },
        {
            key: 'counts',
            header: 'Jumlah Blok & Pekerja',
            cellClassName: 'text-[#466059]',
            sortValue: (d) => (d.blocks_count ?? 0) + (d.workers_count ?? 0),
            render: (d) =>
                `${d.blocks_count ?? 0} Blok • ${d.workers_count ?? 0} Pekerja`,
        },
    ];
    if (canModify) {
        cols.push({
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (d) => deleteBtn(`/master-data/divisions/${d.id}`),
        });
    }
    return cols;
}

export function buildBlockColumns(
    canModify: boolean,
): DataTableColumn<Block>[] {
    const cols: DataTableColumn<Block>[] = [
        {
            key: 'code',
            header: 'Kode Blok',
            cellClassName: 'font-bold',
            sortValue: (b) => b.code,
            render: (b) => b.code,
        },
        {
            key: 'division',
            header: 'Divisi Induk',
            sortValue: (b) => b.division?.code ?? '',
            render: (b) =>
                `${b.division?.code ?? ''} — ${b.division?.name ?? ''}`,
        },
        {
            key: 'year',
            header: 'Tahun Tanam',
            sortValue: (b) => b.planting_year,
            render: (b) => b.planting_year,
        },
        {
            key: 'tph',
            header: 'Titik TPH',
            cellClassName: 'text-[#466059]',
            sortValue: (b) => b.tph_points_count ?? 0,
            render: (b) => `${b.tph_points_count ?? 0} Titik TPH`,
        },
    ];
    if (canModify) {
        cols.push({
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (b) => deleteBtn(`/master-data/blocks/${b.id}`),
        });
    }
    return cols;
}

export function buildTphColumns(
    canModify: boolean,
): DataTableColumn<TphPoint>[] {
    const cols: DataTableColumn<TphPoint>[] = [
        {
            key: 'code',
            header: 'Kode TPH',
            cellClassName: 'font-bold text-[#1C5143]',
            sortValue: (t) => t.code,
            render: (t) => t.code,
        },
        {
            key: 'block',
            header: 'Blok & Divisi',
            sortValue: (t) => t.block?.code ?? '',
            render: (t) =>
                `Blok ${t.block?.code ?? '-'} (${t.block?.division?.code ?? '-'})`,
        },
        {
            key: 'label',
            header: 'Patokan Lokasi',
            sortValue: (t) => t.location_label,
            render: (t) => t.location_label,
        },
        {
            key: 'coords',
            header: 'Koordinat Terkunci',
            cellClassName: 'font-mono text-[11px] text-[#466059]',
            render: (t) => `${t.latitude}, ${t.longitude}`,
        },
    ];
    if (canModify) {
        cols.push({
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (t) => deleteBtn(`/master-data/tph-points/${t.id}`),
        });
    }
    return cols;
}

export function buildWorkerColumns(
    canModify: boolean,
): DataTableColumn<Worker>[] {
    const cols: DataTableColumn<Worker>[] = [
        {
            key: 'code',
            header: 'Kode / NIK',
            cellClassName: 'font-bold',
            sortValue: (w) => w.worker_code,
            render: (w) => w.worker_code,
        },
        {
            key: 'name',
            header: 'Nama Pekerja',
            cellClassName: 'font-semibold',
            sortValue: (w) => w.name,
            render: (w) => w.name,
        },
        {
            key: 'division',
            header: 'Divisi Asal',
            sortValue: (w) => w.division?.code ?? '',
            render: (w) => w.division?.code ?? '-',
        },
        {
            key: 'job_type',
            header: 'Jenis Pekerjaan',
            sortValue: (w) => w.job_type,
            render: (w) => w.job_type,
        },
        {
            key: 'status',
            header: 'Status',
            sortValue: (w) => w.status,
            render: (w) => <StatusBadge status={w.status} />,
        },
    ];
    if (canModify) {
        cols.push({
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (w) => (
                <button
                    type="button"
                    onClick={() =>
                        router.patch(`/master-data/workers/${w.id}/toggle`)
                    }
                    className="text-[11px] font-semibold text-[#1C5143] hover:underline"
                >
                    Ubah Status
                </button>
            ),
        });
    }
    return cols;
}

export function buildTruckColumns(
    canModify: boolean,
): DataTableColumn<Truck>[] {
    const cols: DataTableColumn<Truck>[] = [
        {
            key: 'plate',
            header: 'Nomor Polisi',
            cellClassName: 'font-bold',
            sortValue: (t) => t.plate_number,
            render: (t) => t.plate_number,
        },
        {
            key: 'driver',
            header: 'Nama Supir',
            sortValue: (t) => t.driver_name,
            render: (t) => t.driver_name,
        },
        {
            key: 'phone',
            header: 'No. HP / WhatsApp',
            sortValue: (t) => t.driver_phone,
            render: (t) => t.driver_phone,
        },
        {
            key: 'capacity',
            header: 'Kapasitas Muat',
            cellClassName: 'font-semibold',
            sortValue: (t) => t.capacity_kg,
            render: (t) => formatKg(t.capacity_kg),
        },
    ];
    if (canModify) {
        cols.push({
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (t) => deleteBtn(`/master-data/trucks/${t.id}`),
        });
    }
    return cols;
}

export function buildPksColumns(
    canModify: boolean,
): DataTableColumn<PksMill>[] {
    const cols: DataTableColumn<PksMill>[] = [
        {
            key: 'code',
            header: 'Kode PKS',
            cellClassName: 'font-bold',
            sortValue: (m) => m.code,
            render: (m) => m.code,
        },
        {
            key: 'name',
            header: 'Nama Pabrik Tujuan',
            sortValue: (m) => m.name,
            render: (m) => m.name,
        },
    ];
    if (canModify) {
        cols.push({
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (m) => deleteBtn(`/master-data/pks-mills/${m.id}`),
        });
    }
    return cols;
}
