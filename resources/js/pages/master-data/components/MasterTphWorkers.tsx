import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { DataTable } from '@/components/ekulap/DataTable';
import {
    buildTphColumns,
    buildWorkerColumns,
} from '@/pages/master-data/components/masterDataColumns';
import type { Block, Division, TphPoint, Worker } from '@/types';

type MasterTphWorkersProps = {
    mode: 'tph' | 'workers';
    divisions: Division[];
    blocks: Block[];
    tphPoints: TphPoint[];
    workers: Worker[];
    jobTypes: string[];
    statuses: string[];
    canModify: boolean;
};

export function MasterTphWorkers({
    mode,
    divisions,
    blocks,
    tphPoints,
    workers,
    jobTypes,
    statuses,
    canModify,
}: MasterTphWorkersProps) {
    const tphForm = useForm({
        block_id: blocks[0] ? String(blocks[0].id) : '',
        code: '',
        location_label: '',
        latitude: '3.1245100',
        longitude: '99.3421800',
    });

    const workerForm = useForm({
        division_id: divisions[0] ? String(divisions[0].id) : '',
        worker_code: '',
        name: '',
        job_type: jobTypes[0] ?? 'Pemanen TBS',
        status: statuses[0] ?? 'Aktif',
    });

    const submitTph = (e: FormEvent): void => {
        e.preventDefault();
        tphForm.post('/master-data/tph-points', {
            onSuccess: () => tphForm.reset('code', 'location_label'),
        });
    };

    const submitWorker = (e: FormEvent): void => {
        e.preventDefault();
        workerForm.post('/master-data/workers', {
            onSuccess: () => workerForm.reset('worker_code', 'name'),
        });
    };

    if (mode === 'tph') {
        return (
            <div className="space-y-4">
                {canModify && (
                    <form
                        onSubmit={submitTph}
                        className="grid gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm sm:grid-cols-5"
                    >
                        <select
                            value={tphForm.data.block_id}
                            onChange={(e) =>
                                tphForm.setData('block_id', e.target.value)
                            }
                            className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                        >
                            {blocks.map((b) => (
                                <option key={b.id} value={b.id}>
                                    Blok {b.code} ({b.division?.code})
                                </option>
                            ))}
                        </select>
                        <input
                            value={tphForm.data.code}
                            onChange={(e) =>
                                tphForm.setData('code', e.target.value)
                            }
                            placeholder="TPH-A12-03"
                            required
                            className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                        <input
                            value={tphForm.data.location_label}
                            onChange={(e) =>
                                tphForm.setData(
                                    'location_label',
                                    e.target.value,
                                )
                            }
                            placeholder="Patokan lokasi TPH"
                            required
                            className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                            <input
                                value={tphForm.data.latitude}
                                onChange={(e) =>
                                    tphForm.setData('latitude', e.target.value)
                                }
                                placeholder="Lat"
                                required
                                className="min-h-10 rounded-md border border-[#C8D4C8] px-2 text-xs"
                            />
                            <input
                                value={tphForm.data.longitude}
                                onChange={(e) =>
                                    tphForm.setData('longitude', e.target.value)
                                }
                                placeholder="Lng"
                                required
                                className="min-h-10 rounded-md border border-[#C8D4C8] px-2 text-xs"
                            />
                        </div>
                        <button
                            type="submit"
                            className="min-h-10 rounded-md bg-[#1C5143] px-3 text-xs font-bold text-white"
                        >
                            + Kunci Titik TPH
                        </button>
                    </form>
                )}

                <DataTable
                    data={tphPoints}
                    columns={buildTphColumns(canModify)}
                    getRowKey={(t) => t.id}
                    searchableText={(t) =>
                        `${t.code} ${t.block?.code ?? ''} ${t.block?.division?.code ?? ''} ${t.location_label}`
                    }
                    searchPlaceholder="Cari kode TPH / blok / lokasi..."
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {canModify && (
                <form
                    onSubmit={submitWorker}
                    className="grid gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm sm:grid-cols-5"
                >
                    <select
                        value={workerForm.data.division_id}
                        onChange={(e) =>
                            workerForm.setData('division_id', e.target.value)
                        }
                        className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        {divisions.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.code}
                            </option>
                        ))}
                    </select>
                    <input
                        value={workerForm.data.worker_code}
                        onChange={(e) =>
                            workerForm.setData('worker_code', e.target.value)
                        }
                        placeholder="NIK / PMN-030"
                        required
                        className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                    />
                    <input
                        value={workerForm.data.name}
                        onChange={(e) =>
                            workerForm.setData('name', e.target.value)
                        }
                        placeholder="Nama Pekerja"
                        required
                        className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                    />
                    <select
                        value={workerForm.data.job_type}
                        onChange={(e) =>
                            workerForm.setData('job_type', e.target.value)
                        }
                        className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        {jobTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="min-h-10 rounded-md bg-[#1C5143] px-3 text-xs font-bold text-white"
                    >
                        + Tambah Pekerja
                    </button>
                </form>
            )}

            <DataTable
                data={workers}
                columns={buildWorkerColumns(canModify)}
                getRowKey={(w) => w.id}
                searchableText={(w) =>
                    `${w.worker_code} ${w.name} ${w.division?.code ?? ''} ${w.job_type} ${w.status}`
                }
                searchPlaceholder="Cari NIK / nama pekerja / jabatan..."
            />
        </div>
    );
}
