import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { TphHarvestRow } from '@/pages/tph-harvest/components/TphHarvestRow';
import { TphPhotoPreviewModal } from '@/pages/tph-harvest/components/TphPhotoPreviewModal';
import type { PaginatedData, TphHarvestRecord } from '@/types';

type TphHarvestTableProps = {
    records: PaginatedData<TphHarvestRecord>;
    canDelete: boolean;
};

export function TphHarvestTable({ records, canDelete }: TphHarvestTableProps) {
    const [previewRecord, setPreviewRecord] = useState<TphHarvestRecord | null>(
        null,
    );

    const handleDelete = (record: TphHarvestRecord): void => {
        if (record.loaded_sack_count > 0) {
            return;
        }
        router.delete(`/tph-harvest/${record.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="overflow-hidden rounded-lg border border-[#102B26]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#102B26]/10 bg-[#E9EEE9]/70 text-[#5A6C68]">
                        <tr>
                            <th className="px-4 py-3 font-medium">
                                No. Lot &amp; Tgl
                            </th>
                            <th className="px-4 py-3 font-medium">
                                Divisi / Blok / TPH
                            </th>
                            <th className="px-4 py-3 font-medium">
                                Tenaga Kerja &amp; Petugas Timbang
                            </th>
                            <th className="px-4 py-3 font-medium">
                                Karung, Jml TPH &amp; Berat
                            </th>
                            <th className="px-4 py-3 font-medium">
                                Validasi GPS &amp; Foto
                            </th>
                            <th className="px-4 py-3 font-medium">
                                Status &amp; Progres Naik
                            </th>
                            {canDelete && (
                                <th className="px-4 py-3 text-right font-medium">
                                    Aksi
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#102B26]/8">
                        {records.data.map((record) => (
                            <TphHarvestRow
                                key={record.id}
                                record={record}
                                canDelete={canDelete}
                                onPreviewPhotos={setPreviewRecord}
                                onDelete={handleDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {records.last_page > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#CFD9CF] px-4 py-3 text-xs">
                    <span className="text-[#466059]">
                        Halaman {records.current_page} dari {records.last_page}{' '}
                        ({records.total} lot)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {records.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`rounded-lg px-2.5 py-1 font-semibold ${
                                        link.active
                                            ? 'bg-[#1C5143] text-white'
                                            : 'border border-[#CFD9CF] bg-white text-[#102B26]'
                                    }`}
                                >
                                    {link.label
                                        .replace('&laquo;', '«')
                                        .replace('&raquo;', '»')}
                                </Link>
                            ) : null,
                        )}
                    </div>
                </div>
            )}

            <TphPhotoPreviewModal
                record={previewRecord}
                onClose={() => setPreviewRecord(null)}
            />
        </div>
    );
}
