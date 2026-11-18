import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { DataTable } from '@/components/ekulap/DataTable';
import {
    buildBlockColumns,
    buildDivisionColumns,
} from '@/pages/master-data/components/masterDataColumns';
import type { Block, Division } from '@/types';

type MasterDivisionsBlocksProps = {
    mode: 'divisions' | 'blocks';
    divisions: Division[];
    blocks: Block[];
    canModify: boolean;
};

export function MasterDivisionsBlocks({
    mode,
    divisions,
    blocks,
    canModify,
}: MasterDivisionsBlocksProps) {
    const divForm = useForm({ code: '', name: '' });
    const blockForm = useForm({
        division_id: divisions[0] ? String(divisions[0].id) : '',
        code: '',
        planting_year: '2020',
    });

    const submitDivision = (e: FormEvent): void => {
        e.preventDefault();
        divForm.post('/master-data/divisions', {
            onSuccess: () => divForm.reset(),
        });
    };

    const submitBlock = (e: FormEvent): void => {
        e.preventDefault();
        blockForm.post('/master-data/blocks', {
            onSuccess: () => blockForm.reset('code'),
        });
    };

    if (mode === 'divisions') {
        return (
            <div className="space-y-4">
                {canModify && (
                    <form
                        onSubmit={submitDivision}
                        className="flex flex-wrap items-end gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm"
                    >
                        <div className="w-36">
                            <label className="mb-1 block text-xs font-semibold">
                                Kode Divisi
                            </label>
                            <input
                                value={divForm.data.code}
                                onChange={(e) =>
                                    divForm.setData('code', e.target.value)
                                }
                                placeholder="DIV-V"
                                required
                                className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                            />
                        </div>
                        <div className="min-w-56 flex-1">
                            <label className="mb-1 block text-xs font-semibold">
                                Nama Divisi / Afdeling
                            </label>
                            <input
                                value={divForm.data.name}
                                onChange={(e) =>
                                    divForm.setData('name', e.target.value)
                                }
                                placeholder="Divisi V Sungai Rumbia Estate"
                                required
                                className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={divForm.processing}
                            className="min-h-10 rounded-md bg-[#1C5143] px-4 text-xs font-bold text-white"
                        >
                            + Tambah Divisi
                        </button>
                    </form>
                )}

                <DataTable
                    data={divisions}
                    columns={buildDivisionColumns(canModify)}
                    getRowKey={(d) => d.id}
                    searchableText={(d) => `${d.code} ${d.name}`}
                    searchPlaceholder="Cari kode atau nama divisi..."
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {canModify && (
                <form
                    onSubmit={submitBlock}
                    className="flex flex-wrap items-end gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm"
                >
                    <div className="min-w-48 flex-1">
                        <label className="mb-1 block text-xs font-semibold">
                            Divisi Induk
                        </label>
                        <select
                            value={blockForm.data.division_id}
                            onChange={(e) =>
                                blockForm.setData('division_id', e.target.value)
                            }
                            className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                        >
                            {divisions.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.code} — {d.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32">
                        <label className="mb-1 block text-xs font-semibold">
                            Kode Blok
                        </label>
                        <input
                            value={blockForm.data.code}
                            onChange={(e) =>
                                blockForm.setData('code', e.target.value)
                            }
                            placeholder="A15"
                            required
                            className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                    </div>
                    <div className="w-32">
                        <label className="mb-1 block text-xs font-semibold">
                            Tahun Tanam
                        </label>
                        <input
                            type="number"
                            value={blockForm.data.planting_year}
                            onChange={(e) =>
                                blockForm.setData(
                                    'planting_year',
                                    e.target.value,
                                )
                            }
                            required
                            className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={blockForm.processing}
                        className="min-h-10 rounded-md bg-[#1C5143] px-4 text-xs font-bold text-white"
                    >
                        + Tambah Blok
                    </button>
                </form>
            )}

            <DataTable
                data={blocks}
                columns={buildBlockColumns(canModify)}
                getRowKey={(b) => b.id}
                searchableText={(b) =>
                    `${b.code} ${b.division?.code ?? ''} ${b.division?.name ?? ''} ${b.planting_year}`
                }
                searchPlaceholder="Cari blok / divisi / tahun tanam..."
            />
        </div>
    );
}
