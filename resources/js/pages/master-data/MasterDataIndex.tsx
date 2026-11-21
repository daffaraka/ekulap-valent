import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { MasterDivisionsBlocks } from '@/pages/master-data/components/MasterDivisionsBlocks';
import { MasterTphWorkers } from '@/pages/master-data/components/MasterTphWorkers';
import { MasterTrucksPks } from '@/pages/master-data/components/MasterTrucksPks';
import type {
    Block,
    Division,
    PksMill,
    TphPoint,
    Truck,
    Worker,
} from '@/types';

type MasterTab = 'divisions' | 'blocks' | 'tph' | 'workers' | 'trucks' | 'pks';

type MasterDataIndexProps = {
    activeTab: string;
    divisions: Division[];
    blocks: Block[];
    tphPoints: TphPoint[];
    workers: Worker[];
    trucks: Truck[];
    pksMills: PksMill[];
    jobTypes: string[];
    statuses: string[];
};

const TABS: Array<{ key: MasterTab; label: string }> = [
    { key: 'divisions', label: '2. Divisi / Afdeling' },
    { key: 'blocks', label: '3. Blok Kebun' },
    { key: 'tph', label: '4. Titik TPH' },
    { key: 'workers', label: '5. Tenaga Kerja' },
    { key: 'trucks', label: '6. Armada Truk' },
    { key: 'pks', label: '7. PKS Tujuan' },
];

export default function MasterDataIndex({
    activeTab,
    divisions,
    blocks,
    tphPoints,
    workers,
    trucks,
    pksMills,
    jobTypes,
    statuses,
}: MasterDataIndexProps) {
    const { can } = usePermissions();
    const canModify = can('master-data.manage');

    const initialTab = TABS.some((t) => t.key === activeTab)
        ? (activeTab as MasterTab)
        : 'divisions';
    const [tab, setTab] = useState<MasterTab>(initialTab);

    return (
        <AdminLayout
            title="Master Data Kebun, Armada, & PKS"
            subtitle="Tabel 2 s/d 7 — Penguncian wilayah, titik koordinat TPH paten, pemanen, truk, & PKS"
        >
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2 rounded-lg border border-[#102B26]/10 bg-white p-2.5 shadow-sm">
                    {TABS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setTab(item.key)}
                            className={`min-h-10 rounded-md px-3.5 text-xs font-bold transition ${
                                tab === item.key
                                    ? 'bg-[#1C5143] text-white'
                                    : 'bg-[#E9EEE9]/60 text-[#102B26] hover:bg-[#E9EEE9]'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {(tab === 'divisions' || tab === 'blocks') && (
                    <MasterDivisionsBlocks
                        mode={tab}
                        divisions={divisions}
                        blocks={blocks}
                        canModify={canModify}
                    />
                )}

                {(tab === 'tph' || tab === 'workers') && (
                    <MasterTphWorkers
                        mode={tab}
                        divisions={divisions}
                        blocks={blocks}
                        tphPoints={tphPoints}
                        workers={workers}
                        jobTypes={jobTypes}
                        statuses={statuses}
                        canModify={canModify}
                    />
                )}

                {(tab === 'trucks' || tab === 'pks') && (
                    <MasterTrucksPks
                        mode={tab}
                        trucks={trucks}
                        pksMills={pksMills}
                        canModify={canModify}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
