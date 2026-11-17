import { IconCoconutPalm } from '@/components/ekulap/DuotoneIcons';

export function AuthLoginBrandPanel() {
    return (
        <div className="flex flex-col justify-between bg-[#102B26] p-7 text-[#E9EEE9] lg:col-span-5">
            <div>
                <div className="inline-flex items-center gap-3.5">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-[#D6A84F]/40 bg-[#1C5143] text-[#D6A84F] shadow-sm">
                        <IconCoconutPalm className="size-9" />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            eKULAP
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold tracking-wider text-[#D6A84F] uppercase">
                            Sinarmas Agribusiness
                        </div>
                    </div>
                </div>

                <h2 className="mt-6 text-xl leading-snug font-bold text-white">
                    Elektronik Kutip Lapis — Monitoring Panen TPH–PKS
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#E9EEE9]/80">
                    Masuk menggunakan Nomor Induk Karyawan (NIK) resmi yang
                    telah didaftarkan pada Tabel Pengguna Aplikasi.
                </p>
            </div>

            <div className="mt-6 rounded-lg border border-[#D6A84F]/35 bg-[#1C5143]/60 p-4 text-xs">
                <div className="font-bold text-[#D6A84F]">
                    Standar Keamanan Data
                </div>
                <p className="mt-1 text-[#E9EEE9]/85">
                    Setiap pencatatan timbang TPH, muat SPB truk, dan status
                    kutip lapis tercatat otomatis sesuai jabatan aktif.
                </p>
            </div>
        </div>
    );
}
