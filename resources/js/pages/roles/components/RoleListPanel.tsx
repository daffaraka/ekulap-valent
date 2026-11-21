import type { RoleSummary } from '@/types';

type RoleListPanelProps = {
    roles: RoleSummary[];
    selectedRoleId: number;
    totalPermissions: number;
    canManage: boolean;
    onSelect: (roleId: number) => void;
    onDelete: (role: RoleSummary) => void;
    onOpenCreate?: () => void;
};

type RoleHorizontalButtonProps = {
    role: RoleSummary;
    active: boolean;
    totalPermissions: number;
    canDelete: boolean;
    onSelect: (roleId: number) => void;
    onDelete: (role: RoleSummary) => void;
};

function RoleHorizontalButton({
    role,
    active,
    totalPermissions,
    canDelete,
    onSelect,
    onDelete,
}: RoleHorizontalButtonProps) {
    return (
        <div
            className={`flex min-w-[175px] flex-1 flex-col justify-between rounded-lg border transition ${
                active
                    ? 'border-[#1C5143] bg-[#1C5143] text-white shadow-xs'
                    : 'border-[#102B26]/10 bg-[#F6F8F6] text-[#102B26] hover:border-[#1C5143]/40 hover:bg-[#EEF3EE]'
            }`}
        >
            <button
                type="button"
                onClick={() => onSelect(role.id)}
                className="flex min-h-14 w-full flex-col justify-between gap-1.5 px-3.5 py-2.5 text-left"
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-bold">
                        {role.name}
                    </span>
                    <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            active
                                ? 'bg-white/20 text-white'
                                : role.is_system
                                  ? 'bg-[#E9EEE9] text-[#102B26]'
                                  : 'bg-[#D6A84F]/20 text-[#8A5A00]'
                        }`}
                    >
                        {role.is_system ? 'Sistem' : 'Kustom'}
                    </span>
                </div>
                <div
                    className={`flex items-center justify-between gap-2 text-[11px] ${
                        active ? 'text-white/85' : 'text-[#5A6C68]'
                    }`}
                >
                    <span>{role.users_count} pengguna</span>
                    <span>
                        {role.permissions.length}/{totalPermissions} izin
                    </span>
                </div>
            </button>

            {canDelete && (
                <div
                    className={`flex justify-end border-t px-3 py-1.5 ${
                        active ? 'border-white/15' : 'border-[#102B26]/8'
                    }`}
                >
                    <button
                        type="button"
                        onClick={() => onDelete(role)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                            active
                                ? 'bg-white/15 text-white hover:bg-red-600'
                                : 'text-[#8C2323] hover:bg-red-50'
                        }`}
                    >
                        Hapus Role
                    </button>
                </div>
            )}
        </div>
    );
}

export function RoleListPanel({
    roles,
    selectedRoleId,
    totalPermissions,
    canManage,
    onSelect,
    onDelete,
    onOpenCreate,
}: RoleListPanelProps) {
    return (
        <section className="rounded-xl border border-[#102B26]/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E9EEE9] pb-3.5">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-[#102B26]">
                            Daftar Role ({roles.length})
                        </h2>
                        <span className="rounded-md bg-[#E9EEE9] px-2 py-0.5 text-[11px] font-semibold text-[#1C5143]">
                            {totalPermissions} Izin Modul
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#5A6C68]">
                        Pilih role secara horizontal di bawah untuk mengatur
                        matriks hak akses. Perubahan langsung berlaku tanpa
                        perlu logout.
                    </p>
                </div>

                {canManage && onOpenCreate && (
                    <button
                        type="button"
                        onClick={onOpenCreate}
                        className="min-h-10 rounded-lg bg-[#1C5143] px-4 text-xs font-bold text-white transition hover:bg-[#102B26]"
                    >
                        + Tambah Role Baru
                    </button>
                )}
            </div>

            <div
                role="tablist"
                aria-label="Daftar Role"
                className="flex flex-wrap items-stretch gap-2.5"
            >
                {roles.map((role) => (
                    <RoleHorizontalButton
                        key={role.id}
                        role={role}
                        active={role.id === selectedRoleId}
                        totalPermissions={totalPermissions}
                        canDelete={
                            canManage &&
                            !role.is_system &&
                            role.users_count === 0
                        }
                        onSelect={onSelect}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </section>
    );
}

