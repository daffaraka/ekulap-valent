import { router } from '@inertiajs/react';
import { DataTable } from '@/components/ekulap/DataTable';
import type { DataTableColumn } from '@/components/ekulap/dataTableUtils';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import type { EkulapUser } from '@/types';

type UsersTableProps = {
    users: EkulapUser[];
    canManage: boolean;
    onEdit: (user: EkulapUser) => void;
};

export function UsersTable({ users, canManage, onEdit }: UsersTableProps) {
    const columns: DataTableColumn<EkulapUser>[] = [
        {
            key: 'name',
            header: 'Nama Lengkap',
            sortValue: (u) => u.name,
            render: (user) => (
                <div className="font-bold text-[#102B26]">{user.name}</div>
            ),
        },
        {
            key: 'username',
            header: 'NIK / Nomor HP',
            sortValue: (u) => u.username ?? '',
            render: (user) => (
                <>
                    <div className="font-mono font-semibold text-[#102B26]">
                        {user.username ?? '-'}
                    </div>
                    <div className="text-[11px] text-[#466059]">
                        {user.phone ?? '-'}
                    </div>
                </>
            ),
        },
        {
            key: 'role',
            header: 'Jabatan / Hak Akses',
            cellClassName: 'font-semibold text-[#1C5143]',
            sortValue: (u) => u.role,
            render: (user) => user.role,
        },
        {
            key: 'division',
            header: 'Divisi Penempatan',
            sortValue: (u) => u.division?.code ?? 'Pusat',
            render: (user) =>
                user.division
                    ? `${user.division.code} — ${user.division.name}`
                    : 'Pusat / Lintas Divisi',
        },
        {
            key: 'status',
            header: 'Status Akun',
            sortValue: (u) => u.status,
            render: (user) => <StatusBadge status={user.status} />,
        },
    ];

    if (canManage) {
        columns.push({
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            render: (user) => (
                <div className="inline-flex gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="rounded-lg border border-[#CFD9CF] px-2.5 py-1 text-[11px] font-semibold"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => router.patch(`/users/${user.id}/toggle`)}
                        className="rounded-lg bg-[#E9EEE9] px-2.5 py-1 text-[11px] font-semibold text-[#102B26]"
                    >
                        Toggle Status
                    </button>
                </div>
            ),
        });
    }

    return (
        <DataTable
            data={users}
            columns={columns}
            getRowKey={(u) => u.id}
            searchableText={(u) =>
                `${u.name} ${u.username ?? ''} ${u.phone ?? ''} ${u.role} ${u.division?.code ?? ''}`
            }
            searchPlaceholder="Cari nama / NIK / jabatan..."
            emptyMessage="Belum ada data pengguna."
        />
    );
}
