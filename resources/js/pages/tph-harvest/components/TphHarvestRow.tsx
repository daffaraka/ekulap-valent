import { StatusBadge } from '@/components/ekulap/StatusBadge';
import { getTphHarvestRowClass } from '@/pages/tph-harvest/components/TphHarvestTable';
import {
    formatDateOnly,
    formatDateTime,
    formatKg,
} from '@/services/formatters';
import type { TphHarvestRecord } from '@/types';

type TphHarvestRowProps = {
    record: TphHarvestRecord;
    canDelete: boolean;
    onPreviewPhotos: (record: TphHarvestRecord) => void;
    onDelete: (record: TphHarvestRecord) => void;
};

export function TphHarvestRow({
    record,
    canDelete,
    onPreviewPhotos,
    onDelete,
}: TphHarvestRowProps) {
    const progressPct =
        record.sack_count > 0
            ? Math.round((record.loaded_sack_count / record.sack_count) * 100)
            : 0;
    const isGpsFar =
        record.gps_distance_meters !== null && record.gps_distance_meters > 100;
    const photoCount =
        record.photo_paths && record.photo_paths.length > 0
            ? record.photo_paths.length
            : record.photo_path
              ? 1
              : 0;
    const workerNames =
        record.workers && record.workers.length > 0
            ? record.workers.map((w) => w.name).join(', ')
            : (record.worker?.name ?? '-');
    const blockCodes =
        record.blocks && record.blocks.length > 0
            ? record.blocks.map((b) => b.code).join(', ')
            : (record.block?.code ?? '-');
    const rowHighlight =
        getTphHarvestRowClass(record.transport_status) ||
        'hover:bg-[#E9EEE9]/35';

    return (
        <tr className={rowHighlight}>
            <td className="px-4 py-3">
                <div className="font-bold text-[#102B26]">
                    {record.lot_number}
                </div>
                <div className="text-[11px] text-[#466059]">
                    {formatDateOnly(record.work_date)}
                </div>
                <div className="text-[11px] text-[#466059]">
                    Timbang: {formatDateTime(record.weighed_at)}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="font-bold text-[#1C5143]">
                    Blok {blockCodes} · {record.tph_point?.code ?? '-'}
                </div>
                <div className="text-[11px] text-[#466059]">
                    {record.division?.code}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="font-semibold text-[#102B26]">
                    {workerNames} ({record.harvest_type})
                </div>
                <div className="text-[11px] text-[#466059]">
                    Petugas Timbang:{' '}
                    <span className="font-medium text-[#102B26]">
                        {record.weigher?.name ?? record.recorder?.name ?? '-'}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="font-bold text-[#102B26]">
                    {record.sack_count} Karung ·{' '}
                    {formatKg(record.net_weight_kg)}
                </div>
                <div className="text-[11px] text-[#466059]">
                    Jumlah TPH: {record.tph_count ?? 1} TPH
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-1">
                    {record.gps_distance_meters === null ? (
                        <span className="text-[#466059]">-</span>
                    ) : (
                        <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                isGpsFar
                                    ? 'bg-[#9E2A2B]/12 text-[#8C2323]'
                                    : 'bg-[#1C5143]/12 text-[#1C5143]'
                            }`}
                        >
                            {record.gps_distance_meters} m{' '}
                            {isGpsFar ? '(Menyimpang)' : '(Valid)'}
                        </span>
                    )}
                    {photoCount > 0 && (
                        <button
                            type="button"
                            onClick={() => onPreviewPhotos(record)}
                            className="rounded border border-[#CFD9CF] bg-[#F6F8F6] px-2 py-0.5 text-[11px] font-semibold text-[#1C5143] hover:bg-[#E9EEE9]"
                        >
                            Lihat {photoCount} Foto
                        </button>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <StatusBadge status={record.transport_status} />
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#466059]">
                    <span>
                        {record.loaded_sack_count}/{record.sack_count} Karung
                    </span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#DFE6DF]">
                        <div
                            className="h-full bg-[#1C5143]"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            </td>
            {canDelete && (
                <td className="px-4 py-3 text-right">
                    {record.loaded_sack_count === 0 ? (
                        <button
                            type="button"
                            onClick={() => onDelete(record)}
                            className="rounded-lg border border-[#9E2A2B]/30 px-2.5 py-1 text-[11px] font-semibold text-[#8C2323] hover:bg-[#9E2A2B]/10"
                        >
                            Hapus
                        </button>
                    ) : (
                        <span className="text-[11px] text-[#466059]">
                            Terkunci SPB
                        </span>
                    )}
                </td>
            )}
        </tr>
    );
}
