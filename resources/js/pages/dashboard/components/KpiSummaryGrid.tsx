import { Link } from '@inertiajs/react';
import {
    IconHarvestScale,
    IconMillWeigh,
    IconTruckRoute,
} from '@/components/ekulap/DuotoneIcons';
import { formatKg, formatNumber } from '@/services/formatters';

export type DashboardKpis = {
    total_lots: number;
    total_sacks: number;
    total_net_kg: number;
    remaining_sacks_at_tph: number;
    active_spb_count: number;
    cumulative_restan_days: number;
    max_restan_days?: number;
    pending_restan_lots: number;
    aged_restan_lots?: number;
    pending_station_count?: number;
};

type KpiSummaryGridProps = {
    kpis: DashboardKpis;
};

export function KpiSummaryGrid({ kpis }: KpiSummaryGridProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link
                href="/rekapan-kutip-lapis"
                className="block rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm transition hover:border-[#1C5143]/40 hover:bg-[#F6F8F6]/60"
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#5A6C68]">
                        Total Panen &amp; Kutip Lapis
                    </span>
                    <IconHarvestScale className="size-4 text-[#1C5143]" />
                </div>
                <div className="mt-2.5 text-2xl font-semibold tracking-tight text-[#102B26]">
                    {formatKg(kpis.total_net_kg)}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-[#5A6C68]">
                    <span>
                        {formatNumber(kpis.total_sacks)} Karung ·{' '}
                        {formatNumber(kpis.total_lots)} Stasiun
                    </span>
                    <span className="font-semibold text-[#1C5143]">
                        Rekapan →
                    </span>
                </div>
            </Link>

            <Link
                href="/rekapan-kutip-lapis"
                className="block rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm transition hover:border-[#1C5143]/40 hover:bg-[#F6F8F6]/60"
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#5A6C68]">
                        Restan / Belum Diangkut
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#102B26]/12 bg-[#F6F8F6] px-2 py-0.5 text-[11px] font-medium text-[#102B26]">
                        <span className="size-1.5 rounded-full bg-[#D6A84F]" />
                        TPH
                    </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-2xl font-semibold tracking-tight text-[#102B26]">
                        {formatNumber(kpis.remaining_sacks_at_tph)} Karung
                    </span>
                    <span className="text-xs font-medium text-[#5A6C68]">
                        (restan) / {formatNumber(kpis.total_sacks)} Karung
                    </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#5A6C68]">
                    <span>Total s/d HI panen kutip lapis</span>
                    <span className="shrink-0 font-semibold text-[#1C5143]">
                        Per Tgl →
                    </span>
                </div>
            </Link>

            <div className="rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#5A6C68]">
                        Truk &amp; SPB Aktif
                    </span>
                    <IconTruckRoute className="size-4 text-[#1C5143]" />
                </div>
                <div className="mt-2.5 text-2xl font-semibold tracking-tight text-[#102B26]">
                    {formatNumber(kpis.active_spb_count)} Surat Jalan
                </div>
                <div className="mt-1 text-xs text-[#5A6C68]">
                    Status Belum Muat &amp; Sudah Dikirim
                </div>
            </div>

            <Link
                href="/rekapan-kutip-lapis?tab=station"
                className="block rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm transition hover:border-[#1C5143]/40 hover:bg-[#F6F8F6]/60"
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#5A6C68]">
                        Hari Restan Susut Belum Diangkut
                    </span>
                    <IconMillWeigh className="size-4 text-[#D6A84F]" />
                </div>
                <div className="mt-2.5 text-2xl font-semibold tracking-tight text-[#102B26]">
                    Terlama {formatNumber(kpis.max_restan_days ?? 0)} Hari
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#5A6C68]">
                    <span>
                        Akumulasi{' '}
                        <span className="font-medium text-[#102B26]">
                            {formatNumber(kpis.cumulative_restan_days)} Hari
                        </span>{' '}
                        · {formatNumber(kpis.pending_restan_lots)} Stasiun (
                        {formatNumber(kpis.pending_station_count ?? 0)} Titik
                        TPH)
                    </span>
                    <span className="shrink-0 font-semibold text-[#1C5143]">
                        Per Stasiun →
                    </span>
                </div>
            </Link>
        </div>
    );
}
