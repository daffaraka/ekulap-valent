import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/layouts/AdminLayout';
import { TphHarvestFilterBar } from '@/pages/tph-harvest/components/TphHarvestFilterBar';
import { TphHarvestFormModal } from '@/pages/tph-harvest/components/TphHarvestFormModal';
import { TphHarvestTable } from '@/pages/tph-harvest/components/TphHarvestTable';
import type {
    Block,
    Division,
    PaginatedData,
    TphHarvestRecord,
    TphPoint,
    User,
    WeigherOption,
    Worker,
} from '@/types';

type TphHarvestIndexProps = {
    records: PaginatedData<TphHarvestRecord>;
    filters: {
        search: string;
        status: string;
        division_id: number | null;
    };
    divisions: Division[];
    blocks: Block[];
    tphPoints: TphPoint[];
    workers: Worker[];
    weighers: WeigherOption[];
    harvestTypes: string[];
    transportStatuses: string[];
};

export default function TphHarvestIndex({
    records,
    filters,
    divisions,
    blocks,
    tphPoints,
    workers,
    weighers,
    harvestTypes,
    transportStatuses,
}: TphHarvestIndexProps) {
    const page = usePage<{ auth: { user: User } }>();
    const currentUser = page.props.auth.user;
    const { can } = usePermissions();
    const canCreate = can('tph-harvest.create');
    const canDelete = can('tph-harvest.delete');

    const [search, setSearch] = useState<string>(filters.search);
    const [status, setStatus] = useState<string>(filters.status);
    const [divisionId, setDivisionId] = useState<string>(
        filters.division_id ? String(filters.division_id) : '',
    );
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const applyFilters = (
        nextStatus = status,
        nextDivision = divisionId,
    ): void => {
        router.get(
            '/tph-harvest',
            {
                ...(search ? { search } : {}),
                ...(nextStatus ? { status: nextStatus } : {}),
                ...(nextDivision ? { division_id: nextDivision } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminLayout
            title="Catatan Hasil & Timbang TPH"
            subtitle="Pencatatan karung, berat timbang Kg, multi-pekerja, petugas timbang, & dokumentasi lapangan"
        >
            <div className="space-y-4">
                <TphHarvestFilterBar
                    search={search}
                    status={status}
                    divisionId={divisionId}
                    divisions={divisions}
                    transportStatuses={transportStatuses}
                    canCreate={canCreate}
                    onSearchChange={setSearch}
                    onStatusChange={(val) => {
                        setStatus(val);
                        applyFilters(val, divisionId);
                    }}
                    onDivisionChange={(val) => {
                        setDivisionId(val);
                        applyFilters(status, val);
                    }}
                    onApplyFilter={() => applyFilters()}
                    onOpenCreate={() => setModalOpen(true)}
                />

                <TphHarvestTable records={records} canDelete={canDelete} />

                <TphHarvestFormModal
                    open={modalOpen}
                    blocks={blocks}
                    tphPoints={tphPoints}
                    workers={workers}
                    weighers={weighers}
                    defaultWeigherId={currentUser.id}
                    harvestTypes={harvestTypes}
                    onClose={() => setModalOpen(false)}
                />
            </div>
        </AdminLayout>
    );
}
