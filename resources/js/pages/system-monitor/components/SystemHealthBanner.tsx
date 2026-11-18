import type { SystemOverview } from '@/pages/system-monitor/types';
import { formatNumber } from '@/services/formatters';

type SystemHealthBannerProps = {
    overview: SystemOverview;
};

export function SystemHealthBanner({ overview }: SystemHealthBannerProps) {
    const toneClass =
        overview.status === 'gangguan'
            ? 'border-red-300 bg-red-50 text-red-950'
            : overview.status === 'perhatian'
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : 'border-emerald-300 bg-emerald-50 text-emerald-950';

    const badgeClass =
        overview.status === 'gangguan'
            ? 'bg-red-700 text-white'
            : overview.status === 'perhatian'
              ? 'bg-amber-600 text-white'
              : 'bg-[#1C5143] text-white';

    return (
        <div className="space-y-4">
            <div className={`rounded-xl border p-5 shadow-sm ${toneClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                    >
                        {overview.status_label}
                    </span>
                    <span className="text-xs font-medium opacity-80">
                        {overview.storage_link_active
                            ? 'Folder Foto: Aktif'
                            : 'Folder Foto: Belum Terhubung (storage:link)'}
                    </span>
                </div>
                <h2 className="mt-3 text-base font-bold">
                    {overview.headline}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed opacity-90">
                    {overview.narrative}
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                    <div className="text-xs text-[#5A6C68]">
                        Gangguan Sistem (24 Jam)
                    </div>
                    <div className="mt-1 text-xl font-semibold text-[#102B26]">
                        {formatNumber(overview.errors_24h)} Kejadian
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                        Catatan log: {overview.log_file_size_kb} KB
                    </div>
                </div>

                <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                    <div className="text-xs text-[#5A6C68]">
                        Gagal Upload Foto (24 Jam)
                    </div>
                    <div className="mt-1 text-xl font-semibold text-[#102B26]">
                        {formatNumber(overview.upload_failures_24h)} Kali
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                        Ukuran melebihi batas / koneksi putus
                    </div>
                </div>

                <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                    <div className="text-xs text-[#5A6C68]">
                        Gagal Login (24 Jam)
                    </div>
                    <div className="mt-1 text-xl font-semibold text-[#102B26]">
                        {formatNumber(overview.failed_logins_24h)} Percobaan
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                        Salah kata sandi atau NIK
                    </div>
                </div>

                <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                    <div className="text-xs text-[#5A6C68]">
                        Aktivitas Sensitif (24 Jam)
                    </div>
                    <div className="mt-1 text-xl font-semibold text-[#102B26]">
                        {formatNumber(overview.sensitive_actions_24h)} Aksi
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                        Hapus data, ubah akun, atau susut &gt;2%
                    </div>
                </div>
            </div>
        </div>
    );
}
