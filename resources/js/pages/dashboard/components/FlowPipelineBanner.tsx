import { StatusBadge } from '@/components/ekulap/StatusBadge';
import { formatKg, formatNumber } from '@/services/formatters';

export type StatusBreakdownItem = {
    status: string;
    lot_count: number;
    sack_count: number;
    net_weight_kg: number;
};

type FlowPipelineBannerProps = {
    breakdown: StatusBreakdownItem[];
    totalSacks: number;
};

export function FlowPipelineBanner({
    breakdown,
    totalSacks,
}: FlowPipelineBannerProps) {
    return (
        <section className="rounded-lg border border-[#102B26]/10 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-base font-semibold tracking-tight text-[#102B26]">
                        Status Pengangkutan Barang (TPH → Truk → PKS)
                    </h2>
                    <p className="text-xs text-[#5A6C68]">
                        Pantauan real-time pergerakan karung dan berat bersih
                        per status stasiun.
                    </p>
                </div>
                <span className="rounded-lg bg-[#E9EEE9] px-3 py-1 text-xs font-medium text-[#102B26]">
                    Total {formatNumber(totalSacks)} Karung Tercatat
                </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {breakdown.map((item) => {
                    const ratio =
                        totalSacks > 0
                            ? Math.round((item.sack_count / totalSacks) * 100)
                            : 0;

                    return (
                        <div
                            key={item.status}
                            className="rounded-md border border-[#102B26]/10 bg-[#F6F8F6] p-4"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <StatusBadge status={item.status} />
                                <span className="font-mono text-xs font-medium text-[#5A6C68]">
                                    {ratio}%
                                </span>
                            </div>
                            <div className="mt-3 text-lg font-semibold text-[#102B26]">
                                {formatNumber(item.sack_count)} Karung
                            </div>
                            <div className="text-xs text-[#5A6C68]">
                                {formatKg(item.net_weight_kg)} ·{' '}
                                {item.lot_count} Stasiun
                            </div>
                            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E9EEE9]">
                                <div
                                    className="h-full rounded-full bg-[#1C5143] transition-all"
                                    style={{ width: `${ratio}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
