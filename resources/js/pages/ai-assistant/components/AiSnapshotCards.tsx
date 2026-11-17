import { formatKg, formatNumber } from '@/services/formatters';
import type { AiSnapshot } from '@/types';

type AiSnapshotCardsProps = {
    snapshot: AiSnapshot;
};

export function AiSnapshotCards({ snapshot }: AiSnapshotCardsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                <div className="text-[11px] font-medium text-[#5A6C68]">
                    Tool · Harvest Backlog
                </div>
                <div className="mt-1.5 text-lg font-semibold text-[#102B26]">
                    {formatNumber(snapshot.backlog.total_remaining_sacks)}{' '}
                    Karung Sisa
                </div>
                <div className="mt-0.5 text-xs text-[#5A6C68]">
                    {formatKg(snapshot.backlog.total_remaining_kg)} ·{' '}
                    {snapshot.backlog.pending_lot_count} Lot TPH
                </div>
            </div>

            <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                <div className="text-[11px] font-medium text-[#5A6C68]">
                    Tool · Shrinkage Audit
                </div>
                <div className="mt-1.5 text-lg font-semibold text-[#102B26]">
                    {snapshot.shrinkage.anomaly_count} SPB Anomali &gt;2%
                </div>
                <div className="mt-0.5 text-xs text-[#5A6C68]">
                    Total susut{' '}
                    {formatKg(snapshot.shrinkage.total_shrinkage_kg)} (
                    {snapshot.shrinkage.average_shrinkage_percent}%)
                </div>
            </div>

            <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                <div className="text-[11px] font-medium text-[#5A6C68]">
                    Tool · GPS Deviation
                </div>
                <div className="mt-1.5 text-lg font-semibold text-[#102B26]">
                    {snapshot.gps_audit.flagged_count} Lot Menyimpang
                </div>
                <div className="mt-0.5 text-xs text-[#5A6C68]">
                    Batas toleransi: {snapshot.gps_audit.max_tolerance_meters}{' '}
                    meter
                </div>
            </div>

            <div className="rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm">
                <div className="text-[11px] font-medium text-[#5A6C68]">
                    Tool · Worker Production
                </div>
                <div className="mt-1.5 text-lg font-semibold text-[#102B26]">
                    {snapshot.workers.ranking[0]?.name ?? '-'}
                </div>
                <div className="mt-0.5 text-xs text-[#5A6C68]">
                    Top produktivitas:{' '}
                    {formatKg(snapshot.workers.ranking[0]?.total_net_kg ?? 0)}
                </div>
            </div>
        </div>
    );
}
