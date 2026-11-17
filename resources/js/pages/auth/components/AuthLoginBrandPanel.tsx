export function AuthLoginBrandPanel() {
    return (
        <div className="flex flex-col justify-between bg-[#102B26] p-7 text-[#E9EEE9] lg:col-span-5">
            <div>
                <div className="overflow-hidden rounded-lg border border-[#D6A84F]/35 bg-black p-2 shadow-md">
                    <img
                        src="/images/ekulap-logo.jpg"
                        alt="e-KULAP — Kutip Lapis Monitoring System"
                        className="w-full object-contain"
                    />
                </div>

                <h2 className="mt-5 text-xl leading-snug font-bold text-white">
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
