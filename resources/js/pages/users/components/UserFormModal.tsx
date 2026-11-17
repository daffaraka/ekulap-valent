import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { UserRoleFields } from '@/pages/users/components/UserRoleFields';
import type { Division, EkulapUser, RecordStatus, UserRole } from '@/types';

type UserFormModalProps = {
    open: boolean;
    editingUser: EkulapUser | null;
    divisions: Division[];
    roles: string[];
    statuses: string[];
    onClose: () => void;
};

export function UserFormModal({
    open,
    editingUser,
    divisions,
    roles,
    statuses,
    onClose,
}: UserFormModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: editingUser?.name ?? '',
        username: editingUser?.username ?? '',
        phone: editingUser?.phone ?? '',
        password: '',
        role:
            editingUser?.role ?? ((roles[1] ?? 'Kerani Produksi') as UserRole),
        division_id: editingUser?.division_id
            ? String(editingUser.division_id)
            : '',
        status: editingUser?.status ?? ('Aktif' as RecordStatus),
    });

    if (!open) {
        return null;
    }

    const handleSubmit = (event: FormEvent): void => {
        event.preventDefault();
        if (editingUser) {
            put(`/users/${editingUser.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
            return;
        }

        post('/users', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B26]/65 p-4">
            <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-lg border border-[#CFD9CF] bg-white p-5 shadow-xl sm:p-6">
                <div className="flex items-center justify-between border-b border-[#E9EEE9] pb-3">
                    <h2 className="text-base font-bold text-[#102B26]">
                        {editingUser
                            ? `Edit Pengguna: ${editingUser.name}`
                            : 'Tambah Pengguna Aplikasi'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2.5 py-1 text-sm font-bold text-[#466059]"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                    <div>
                        <label className="mb-1 block text-xs font-semibold">
                            Nama Lengkap
                        </label>
                        <input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="Nama lengkap petugas"
                            className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-semibold">
                                NIK (Username Login)
                            </label>
                            <input
                                value={data.username}
                                onChange={(e) =>
                                    setData('username', e.target.value)
                                }
                                required
                                placeholder="Contoh: 10010008"
                                className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                            />
                            <InputError message={errors.username} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold">
                                Nomor HP
                            </label>
                            <input
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                placeholder="0812xxxxxxxx"
                                className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold">
                            Kata Sandi{' '}
                            {editingUser ? '(Kosongkan jika tetap)' : ''}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required={!editingUser}
                            placeholder="Minimal 6 karakter"
                            className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <UserRoleFields
                        role={data.role}
                        divisionId={data.division_id}
                        status={data.status}
                        roles={roles}
                        divisions={divisions}
                        statuses={statuses}
                        onRoleChange={(val) => setData('role', val)}
                        onDivisionChange={(val) => setData('division_id', val)}
                        onStatusChange={(val) => setData('status', val)}
                    />

                    <div className="flex justify-end gap-2 border-t border-[#E9EEE9] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-11 rounded-md border border-[#CFD9CF] px-4 text-xs font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="min-h-11 rounded-md bg-[#1C5143] px-5 text-xs font-bold text-white"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
