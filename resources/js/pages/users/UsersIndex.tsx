import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { UserFormModal } from '@/pages/users/components/UserFormModal';
import { UsersTable } from '@/pages/users/components/UsersTable';
import type { Division, EkulapUser } from '@/types';

type UsersIndexProps = {
    users: EkulapUser[];
    divisions: Division[];
    roles: string[];
    statuses: string[];
};

export default function UsersIndex({
    users,
    divisions,
    roles,
    statuses,
}: UsersIndexProps) {
    const { can } = usePermissions();
    const canManage = can('users.manage');

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<EkulapUser | null>(null);

    const openCreate = (): void => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const openEdit = (user: EkulapUser): void => {
        setEditingUser(user);
        setModalOpen(true);
    };

    return (
        <AdminLayout
            title="Manajemen Pengguna Aplikasi"
            subtitle="Tabel 1 — Pengaturan akun, jabatan hak akses, penempatan divisi, & status aktif"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                    <div className="text-xs text-[#466059]">
                        Total {users.length} pengguna terdaftar dalam sistem
                        eKULAP
                    </div>
                    {canManage && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="min-h-11 rounded-md bg-[#1C5143] px-4 text-xs font-bold text-white"
                        >
                            + Tambah Pengguna
                        </button>
                    )}
                </div>

                <UsersTable
                    users={users}
                    canManage={canManage}
                    onEdit={openEdit}
                />

                <UserFormModal
                    key={editingUser?.id ?? 'new'}
                    open={modalOpen}
                    editingUser={editingUser}
                    divisions={divisions}
                    roles={roles}
                    statuses={statuses}
                    onClose={() => setModalOpen(false)}
                />
            </div>
        </AdminLayout>
    );
}
