import type { StatusBreakdownItem } from '@/pages/dashboard/components/FlowPipelineBanner';
import { formatKg, formatNumber } from '@/services/formatters';

type DashboardChartsRowProps = {
    breakdown: StatusBreakdownItem[];
    totalSacks: number;
};

const SEGMENT_COLORS: Record<string, string> = {
    'Belum Diangkut': '#D6A84F',
    'Diangkut Sebagian': '#7A8C85',
    'Sudah Diangkut': '#1C5143',
};

export function DashboardChartsRow({
    breakdown,
    totalSacks,
}: DashboardChartsRowProps) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;

    let cumulativeOffset = 0;
    const segments = breakdown
        .filter((item) => item.status !== 'Sudah Masuk PKS')
        .map((item) => {
            const fraction = totalSacks > 0 ? item.sack_count / totalSacks : 0;
            const length = fraction * circumference;
            const segment = {
                ...item,
                color: SEGMENT_COLORS[item.status] ?? '#1C5143',
                dashArray: `${length} ${circumference - length}`,
                dashOffset: -cumulativeOffset,
                percent: Math.round(fraction * 100),
            };
            cumulativeOffset += length;
            return segment;
        });

    return (
        <section className="rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-base font-semibold tracking-tight text-[#102B26]">
                        Distribusi Status Karung
                    </h2>
                    <p className="text-xs text-[#5A6C68]">
                        Proporsi karung aktif di TPH hingga dimuat ke angkutan
                        truk
                    </p>
                </div>
                <span className="rounded-md bg-[#F6F8F6] px-3 py-1 text-xs font-semibold text-[#102B26]">
                    Total {formatNumber(totalSacks)} Karung
                </span>
            </div>

            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative flex size-40 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 140 140" className="size-full -rotate-90">
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="#E9EEE9"
                            strokeWidth="16"
                        />
                        {segments.map((seg) => (
                            <circle
                                key={seg.status}
                                cx="70"
                                cy="70"
                                r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth="16"
                                strokeDasharray={seg.dashArray}
                                strokeDashoffset={seg.dashOffset}
                            />
                        ))}
                    </svg>
                    <div className="absolute text-center">
                        <div className="text-lg font-semibold text-[#102B26]">
                            {formatNumber(totalSacks)}
                        </div>
                        <div className="text-[11px] font-medium text-[#5A6C68]">
                            Karung
                        </div>
                    </div>
                </div>

                <div className="grid w-full gap-2.5 sm:grid-cols-3">
                    {segments.map((seg) => (
                        <div
                            key={seg.status}
                            className="flex flex-col justify-between rounded-lg border border-[#102B26]/8 bg-[#F6F8F6] p-3 text-xs"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="size-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: seg.color }}
                                />
                                <span className="font-semibold text-[#102B26]">
                                    {seg.status}
                                </span>
                            </div>
                            <div className="mt-2 text-lg font-bold text-[#102B26]">
                                {formatNumber(seg.sack_count)} Karung{' '}
                                <span className="text-xs font-medium text-[#5A6C68]">
                                    ({seg.percent}%)
                                </span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                                {formatKg(seg.net_weight_kg)} · {seg.lot_count}{' '}
                                Lot
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Perbandingan Estimasi Kebun vs Netto PKS dikomentari sesuai revisi */}
        </section>
    );
}
