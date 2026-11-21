import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { PermissionGroup, RoleSummary } from '@/types';

type PermissionMatrixCardProps = {
    role: RoleSummary;
    permissionGroups: PermissionGroup[];
    canManage: boolean;
};

type PermissionOptionRowProps = {
    label: string;
    description: string;
    checked: boolean;
    editable: boolean;
    onToggle: () => void;
};

function PermissionOptionRow({
    label,
    description,
    checked,
    editable,
    onToggle,
}: PermissionOptionRowProps) {
    return (
        <label
            className={`flex min-h-11 items-start gap-2.5 rounded-lg border px-2.5 py-2 text-xs transition ${
                editable ? 'cursor-pointer' : 'cursor-default opacity-90'
            } ${
                checked
                    ? 'border-[#5D420B] bg-[#5D420B] text-[#FAF6EE] shadow-xs'
                    : 'border-[#102B26]/10 bg-white text-[#102B26] hover:border-[#5D420B]/40'
            }`}
        >
            <input
                type="checkbox"
                checked={checked}
                disabled={!editable}
                onChange={onToggle}
                className={`mt-0.5 size-4 shrink-0 ${
                    checked ? 'accent-[#D6A84F]' : 'accent-[#5D420B]'
                }`}
            />
            <div className="min-w-0">
                <div
                    className={`font-semibold ${
                        checked ? 'text-[#FAF6EE]' : 'text-[#102B26]'
                    }`}
                >
                    {label}
                </div>
                <div
                    className={`text-[11px] ${
                        checked ? 'text-[#EDE4D3]/90' : 'text-[#5A6C68]'
                    }`}
                >
                    {description}
                </div>
            </div>
        </label>
    );
}

type PermissionGroupCardProps = {
    group: PermissionGroup;
    selected: string[];
    editable: boolean;
    onToggleGroup: (group: PermissionGroup) => void;
    onTogglePermission: (permissionName: string) => void;
};

function PermissionGroupCard({
    group,
    selected,
    editable,
    onToggleGroup,
    onTogglePermission,
}: PermissionGroupCardProps) {
    const groupNames = group.permissions.map((p) => p.name);
    const checkedCount = groupNames.filter((name) =>
        selected.includes(name),
    ).length;
    const allChecked = checkedCount === groupNames.length;

    return (
        <div className="flex flex-col rounded-xl border border-[#102B26]/10 bg-[#F6F8F6]/70 p-3.5">
            <div className="mb-2.5 flex items-start justify-between gap-2">
                <div>
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-[#102B26]">
                            {group.label}
                        </h3>
                        <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                checkedCount > 0
                                    ? 'bg-[#5D420B]/15 text-[#5D420B]'
                                    : 'bg-[#E9EEE9] text-[#5A6C68]'
                            }`}
                        >
                            {checkedCount}/{groupNames.length}
                        </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#5A6C68]">
                        {group.description}
                    </p>
                </div>
                {editable && (
                    <button
                        type="button"
                        onClick={() => onToggleGroup(group)}
                        className="shrink-0 rounded-md border border-[#161615] bg-[#161615] px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-black"
                    >
                        {allChecked ? 'Kosongkan' : 'Semua'}
                    </button>
                )}
            </div>

            <div className="space-y-1.5">
                {group.permissions.map((permission) => (
                    <PermissionOptionRow
                        key={permission.name}
                        label={permission.label}
                        description={permission.description}
                        checked={selected.includes(permission.name)}
                        editable={editable}
                        onToggle={() => onTogglePermission(permission.name)}
                    />
                ))}
            </div>
        </div>
    );
}

export function PermissionMatrixCard({
    role,
    permissionGroups,
    canManage,
}: PermissionMatrixCardProps) {
    const [selected, setSelected] = useState<string[]>(role.permissions);
    const [saving, setSaving] = useState<boolean>(false);

    const editable = canManage && !role.is_admin;

    const isDirty =
        selected.length !== role.permissions.length ||
        selected.some((item) => !role.permissions.includes(item));

    const togglePermission = (permissionName: string): void => {
        if (!editable) {
            return;
        }
        setSelected((prev) =>
            prev.includes(permissionName)
                ? prev.filter((item) => item !== permissionName)
                : [...prev, permissionName],
        );
    };

    const toggleGroup = (group: PermissionGroup): void => {
        if (!editable) {
            return;
        }
        const groupNames = group.permissions.map((item) => item.name);
        const allChecked = groupNames.every((name) => selected.includes(name));

        setSelected((prev) => {
            if (allChecked) {
                return prev.filter((item) => !groupNames.includes(item));
            }
            return Array.from(new Set([...prev, ...groupNames]));
        });
    };

    const handleSave = (): void => {
        if (!editable || saving) {
            return;
        }
        setSaving(true);
        router.put(
            `/roles/${role.id}/permissions`,
            { permissions: selected },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <section className="rounded-xl border border-[#102B26]/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E9EEE9] pb-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-[#102B26]">
                            Matriks Izin: {role.name}
                        </h2>
                        <span className="rounded-md bg-[#E9EEE9] px-2 py-0.5 text-[11px] font-semibold text-[#1C5143]">
                            {selected.length} izin aktif
                        </span>
                        <span className="rounded-md bg-[#F6F8F6] px-2 py-0.5 text-[11px] font-medium text-[#5A6C68]">
                            {role.users_count} pengguna
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-[#5A6C68]">
                        {role.is_admin
                            ? 'Role Admin dilindungi sebagai Super Admin dengan akses penuh seluruh modul.'
                            : 'Centang hak akses per modul yang diizinkan untuk role ini, lalu simpan perubahan.'}
                    </p>
                </div>

                {editable && (
                    <div className="flex items-center gap-2">
                        {isDirty && (
                            <button
                                type="button"
                                onClick={() => setSelected(role.permissions)}
                                className="min-h-10 rounded-lg border border-[#C8D4C8] px-3 text-xs font-semibold text-[#102B26] hover:bg-[#F6F8F6]"
                            >
                                Batalkan
                            </button>
                        )}
                        <button
                            type="button"
                            disabled={!isDirty || saving}
                            onClick={handleSave}
                            className="min-h-10 rounded-lg bg-[#1C5143] px-4 text-xs font-bold text-white transition hover:bg-[#102B26] disabled:opacity-50"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Izin Role'}
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-4 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {permissionGroups.map((group) => (
                    <PermissionGroupCard
                        key={group.key}
                        group={group}
                        selected={selected}
                        editable={editable}
                        onToggleGroup={toggleGroup}
                        onTogglePermission={togglePermission}
                    />
                ))}
            </div>
        </section>
    );
}

