import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { AuthLoginBrandPanel } from '@/pages/auth/components/AuthLoginBrandPanel';

type DemoAccount = {
    label: string;
    username: string;
    name: string;
};

type AuthLoginProps = {
    status?: string;
    demoAccounts?: DemoAccount[];
};

export default function AuthLogin({
    status,
    demoAccounts = [],
}: AuthLoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const handleSubmit = (event: FormEvent): void => {
        event.preventDefault();
        post('/login');
    };

    const fillDemoAccount = (nik: string): void => {
        setData({
            ...data,
            email: nik,
            password: 'password',
        });
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-[#E9EEE9] px-4 py-8 text-[#102B26]">
            <Head title="Masuk Aplikasi eKULAP" />

            <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-lg border border-[#CFD9CF] bg-white shadow-xl lg:grid-cols-12">
                <AuthLoginBrandPanel />

                <div className="p-6 sm:p-8 lg:col-span-7">
                    <h1 className="text-xl font-bold text-[#102B26]">
                        Masuk ke Akun
                    </h1>
                    <p className="mt-1 text-xs text-[#466059]">
                        Gunakan NIK akun aktif Anda untuk mengakses sistem
                        operasional kebun.
                    </p>

                    {status && (
                        <div className="mt-4 rounded-md border border-[#1C5143]/30 bg-[#1C5143]/10 px-3 py-2 text-xs font-medium text-[#1C5143]">
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div>
                            <label
                                htmlFor="nik-input"
                                className="mb-1.5 block text-xs font-semibold text-[#102B26]"
                            >
                                NIK (Nomor Induk Karyawan)
                            </label>
                            <input
                                id="nik-input"
                                type="text"
                                name="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                                autoFocus
                                placeholder="Contoh: 10010001"
                                className="min-h-11 w-full rounded-md border border-[#C8D4C8] bg-[#E9EEE9]/45 px-3.5 text-sm text-[#102B26] focus:border-[#1C5143] focus:bg-white focus:outline-none"
                            />
                            <InputError
                                message={errors.email}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-xs font-semibold text-[#102B26]"
                            >
                                Kata Sandi
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                required
                                placeholder="Masukkan kata sandi"
                                className="min-h-11 w-full rounded-md border border-[#C8D4C8] bg-[#E9EEE9]/45 px-3.5 text-sm text-[#102B26] focus:border-[#1C5143] focus:bg-white focus:outline-none"
                            />
                            <InputError
                                message={errors.password}
                                className="mt-1"
                            />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-[#466059]">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                                className="size-4 rounded border-[#C8D4C8] accent-[#1C5143]"
                            />
                            Ingat sesi login perangkat ini
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="min-h-11 w-full rounded-md bg-[#1C5143] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#102B26] disabled:opacity-60"
                        >
                            {processing ? 'Memverifikasi...' : 'Masuk Aplikasi'}
                        </button>
                    </form>

                    {demoAccounts.length > 0 && (
                        <div className="mt-6 border-t border-[#CFD9CF] pt-4">
                            <div className="mb-2 text-xs font-semibold text-[#466059]">
                                Isi Cepat Akun Demo NIK (Kata Sandi:{' '}
                                <code className="rounded bg-[#E9EEE9] px-1.5 py-0.5 text-[#102B26]">
                                    password
                                </code>
                                )
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {demoAccounts.map((acc) => (
                                    <button
                                        key={acc.username}
                                        type="button"
                                        onClick={() =>
                                            fillDemoAccount(acc.username)
                                        }
                                        className="min-h-11 rounded-md border border-[#CFD9CF] bg-[#E9EEE9]/65 px-2.5 py-1.5 text-left transition hover:border-[#1C5143] hover:bg-[#1C5143]/10"
                                    >
                                        <div className="truncate text-[11px] font-bold text-[#102B26]">
                                            {acc.label}
                                        </div>
                                        <div className="truncate text-[10px] text-[#466059]">
                                            NIK: {acc.username}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
