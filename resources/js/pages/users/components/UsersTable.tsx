import { router } from '@inertiajs/react';
import { StatusBadge } from '@/components/ekulap/StatusBadge';
import type { EkulapUser } from '@/types';

type UsersTableProps = {
    users: EkulapUser[];
    canManage: boolean;
    onEdit: (user: EkulapUser) => void;
};

export function UsersTable({ users, canManage, onEdit }: UsersTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-[#102B26]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#102B26]/10 bg-[#E9EEE9]/70 text-[#5A6C68]">
                        <tr>
                            <th className="px-4 py-3 font-semibold">
                                Nama Lengkap
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                NIK / Nomor HP
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Jabatan / Hak Akses
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Divisi Penempatan
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Status Akun
                            </th>
                            {canManage && (
                                <th className="px-4 py-3 text-right font-semibold">
                                    Aksi
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9EEE9]">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-[#E9EEE9]/35">
                                <td className="px-4 py-3">
                                    <div className="font-bold text-[#102B26]">
                                        {user.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-mono font-semibold text-[#102B26]">
                                        {user.username ?? '-'}
                                    </div>
                                    <div className="text-[11px] text-[#466059]">
                                        {user.phone ?? '-'}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-semibold text-[#1C5143]">
                                    {user.role}
                                </td>
                                <td className="px-4 py-3">
                                    {user.division
                                        ? `${user.division.code} — ${user.division.name}`
                                        : 'Pusat / Lintas Divisi'}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={user.status} />
                                </td>
                                {canManage && (
                                    <td className="px-4 py-3 text-right">
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
                                                onClick={() =>
                                                    router.patch(
                                                        `/users/${user.id}/toggle`,
                                                    )
                                                }
                                                className="rounded-lg bg-[#E9EEE9] px-2.5 py-1 text-[11px] font-semibold text-[#102B26]"
                                            >
                                                Toggle Status
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
