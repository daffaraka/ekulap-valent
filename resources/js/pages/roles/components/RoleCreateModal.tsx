import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import type { RoleSummary } from '@/types';

type RoleCreateModalProps = {
    open: boolean;
    existingRoles: RoleSummary[];
    onClose: () => void;
};

export function RoleCreateModal({
    open,
    existingRoles,
    onClose,
}: RoleCreateModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        template_role: '',
    });

    if (!open) {
        return null;
    }

    const handleSubmit = (event: FormEvent): void => {
        event.preventDefault();
        post('/roles', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B26]/65 p-4">
            <div className="w-full max-w-md rounded-xl border border-[#CFD9CF] bg-white p-5 shadow-xl sm:p-6">
                <div className="flex items-center justify-between border-b border-[#E9EEE9] pb-3">
                    <div>
                        <h2 className="text-base font-bold text-[#102B26]">
                            Tambah Role Baru
                        </h2>
                        <p className="text-xs text-[#5A6C68]">
                            Buat jabatan baru lalu sesuaikan matriks izinnya
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-2.5 py-1 text-sm font-bold text-[#466059] hover:bg-[#E9EEE9]"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-[#102B26]">
                            Nama Role / Jabatan
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="Contoh: Mandor Panen atau Auditor Kebun"
                            className="min-h-11 w-full rounded-lg border border-[#C8D4C8] px-3 text-xs text-[#102B26] focus:border-[#1C5143] focus:outline-none"
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-[#102B26]">
                            Salin Izin Awal dari Role (Opsional)
                        </label>
                        <select
                            value={data.template_role}
                            onChange={(e) =>
                                setData('template_role', e.target.value)
                            }
                            className="min-h-11 w-full rounded-lg border border-[#C8D4C8] bg-white px-3 text-xs text-[#102B26] focus:border-[#1C5143] focus:outline-none"
                        >
                            <option value="">
                                Kosong (atur centang izin manual setelah dibuat)
                            </option>
                            {existingRoles.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {role.name} ({role.permissions.length} izin)
                                </option>
                            ))}
                        </select>
                        <InputError
                            message={errors.template_role}
                            className="mt-1"
                        />
                    </div>

                    <div className="flex justify-end gap-2 border-t border-[#E9EEE9] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-11 rounded-lg border border-[#CFD9CF] px-4 text-xs font-semibold text-[#102B26]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || data.name.trim() === ''}
                            className="min-h-11 rounded-lg bg-[#1C5143] px-5 text-xs font-bold text-white transition hover:bg-[#102B26] disabled:opacity-60"
                        >
                            {processing ? 'Menyimpan...' : 'Buat Role'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
