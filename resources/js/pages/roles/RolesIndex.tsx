import { router } from '@inertiajs/react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { PermissionMatrixCard } from '@/pages/roles/components/PermissionMatrixCard';
import { RoleCreateModal } from '@/pages/roles/components/RoleCreateModal';
import { RoleListPanel } from '@/pages/roles/components/RoleListPanel';
import type { PermissionGroup, RoleSummary } from '@/types';

type RolesIndexProps = {
    roles: RoleSummary[];
    permissionGroups: PermissionGroup[];
};

export default function RolesIndex({
    roles,
    permissionGroups,
}: RolesIndexProps) {
    const { can } = usePermissions();
    const canManage = can('roles.manage');

    const [selectedRoleId, setSelectedRoleId] = useState<number>(
        roles[0]?.id ?? 0,
    );
    const [createOpen, setCreateOpen] = useState<boolean>(false);

    const activeRole =
        roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null;

    const totalPermissions = permissionGroups.reduce(
        (sum, group) => sum + group.permissions.length,
        0,
    );

    const handleDeleteRole = (role: RoleSummary): void => {
        if (role.is_system || role.users_count > 0) {
            return;
        }
        router.delete(`/roles/${role.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedRoleId === role.id && roles[0]) {
                    setSelectedRoleId(roles[0].id);
                }
            },
        });
    };

    return (
        <AdminLayout
            title="Manajemen Role & Hak Akses (RBAC)"
            subtitle="Atur peran jabatan dan matriks izin per modul secara dinamis dengan spatie/laravel-permission"
        >
            <div className="space-y-4">
                <RoleListPanel
                    roles={roles}
                    selectedRoleId={activeRole?.id ?? 0}
                    totalPermissions={totalPermissions}
                    canManage={canManage}
                    onSelect={setSelectedRoleId}
                    onDelete={handleDeleteRole}
                    onOpenCreate={() => setCreateOpen(true)}
                />

                {activeRole ? (
                    <PermissionMatrixCard
                        key={`${activeRole.id}-${activeRole.permissions.join(',')}`}
                        role={activeRole}
                        permissionGroups={permissionGroups}
                        canManage={canManage}
                    />
                ) : (
                    <div className="rounded-xl border border-[#102B26]/10 bg-white p-8 text-center text-xs text-[#5A6C68]">
                        Pilih salah satu role untuk melihat dan mengatur matriks
                        hak aksesnya.
                    </div>
                )}

                <RoleCreateModal
                    open={createOpen}
                    existingRoles={roles}
                    onClose={() => setCreateOpen(false)}
                />
            </div>
        </AdminLayout>
    );
}
