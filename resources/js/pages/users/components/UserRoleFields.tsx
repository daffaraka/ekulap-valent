import type { Division, RecordStatus, UserRole } from '@/types';

type UserRoleFieldsProps = {
    role: UserRole;
    divisionId: string;
    status: RecordStatus;
    roles: string[];
    divisions: Division[];
    statuses: string[];
    onRoleChange: (value: UserRole) => void;
    onDivisionChange: (value: string) => void;
    onStatusChange: (value: RecordStatus) => void;
};

export function UserRoleFields({
    role,
    divisionId,
    status,
    roles,
    divisions,
    statuses,
    onRoleChange,
    onDivisionChange,
    onStatusChange,
}: UserRoleFieldsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <div>
                <label className="mb-1 block text-xs font-semibold">
                    Jabatan / Hak Akses
                </label>
                <select
                    value={role}
                    onChange={(e) => onRoleChange(e.target.value as UserRole)}
                    className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                >
                    {roles.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="mb-1 block text-xs font-semibold">
                    Divisi Penempatan
                </label>
                <select
                    value={divisionId}
                    onChange={(e) => onDivisionChange(e.target.value)}
                    className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                >
                    <option value="">Pusat / Lintas Divisi</option>
                    {divisions.map((div) => (
                        <option key={div.id} value={div.id}>
                            {div.code} — {div.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="mb-1 block text-xs font-semibold">
                    Status Akun
                </label>
                <select
                    value={status}
                    onChange={(e) =>
                        onStatusChange(e.target.value as RecordStatus)
                    }
                    className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                >
                    {statuses.map((st) => (
                        <option key={st} value={st}>
                            {st}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
