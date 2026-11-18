import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { DataTable } from '@/components/ekulap/DataTable';
import {
    buildPksColumns,
    buildTruckColumns,
} from '@/pages/master-data/components/masterDataColumns';
import type { PksMill, Truck } from '@/types';

type MasterTrucksPksProps = {
    mode: 'trucks' | 'pks';
    trucks: Truck[];
    pksMills: PksMill[];
    canModify: boolean;
};

export function MasterTrucksPks({
    mode,
    trucks,
    pksMills,
    canModify,
}: MasterTrucksPksProps) {
    const truckForm = useForm({
        plate_number: '',
        driver_name: '',
        driver_phone: '',
        capacity_kg: '8000',
    });

    const pksForm = useForm({ code: '', name: '' });

    const submitTruck = (e: FormEvent): void => {
        e.preventDefault();
        truckForm.post('/master-data/trucks', {
            onSuccess: () =>
                truckForm.reset('plate_number', 'driver_name', 'driver_phone'),
        });
    };

    const submitPks = (e: FormEvent): void => {
        e.preventDefault();
        pksForm.post('/master-data/pks-mills', {
            onSuccess: () => pksForm.reset(),
        });
    };

    if (mode === 'trucks') {
        return (
            <div className="space-y-4">
                {canModify && (
                    <form
                        onSubmit={submitTruck}
                        className="grid gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm sm:grid-cols-5"
                    >
                        <input
                            value={truckForm.data.plate_number}
                            onChange={(e) =>
                                truckForm.setData(
                                    'plate_number',
                                    e.target.value,
                                )
                            }
                            placeholder="BK 8899 ZZ"
                            required
                            className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                        <input
                            value={truckForm.data.driver_name}
                            onChange={(e) =>
                                truckForm.setData('driver_name', e.target.value)
                            }
                            placeholder="Nama Supir"
                            required
                            className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                        <input
                            value={truckForm.data.driver_phone}
                            onChange={(e) =>
                                truckForm.setData(
                                    'driver_phone',
                                    e.target.value,
                                )
                            }
                            placeholder="No HP / WA"
                            required
                            className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                        <input
                            type="number"
                            value={truckForm.data.capacity_kg}
                            onChange={(e) =>
                                truckForm.setData('capacity_kg', e.target.value)
                            }
                            placeholder="Kapasitas Kg"
                            required
                            className="min-h-10 rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                        <button
                            type="submit"
                            className="min-h-10 rounded-md bg-[#1C5143] px-3 text-xs font-bold text-white"
                        >
                            + Tambah Truk
                        </button>
                    </form>
                )}

                <DataTable
                    data={trucks}
                    columns={buildTruckColumns(canModify)}
                    getRowKey={(t) => t.id}
                    searchableText={(t) =>
                        `${t.plate_number} ${t.driver_name} ${t.driver_phone}`
                    }
                    searchPlaceholder="Cari nopol / nama supir / HP..."
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {canModify && (
                <form
                    onSubmit={submitPks}
                    className="flex flex-wrap items-end gap-3 rounded-lg border border-[#102B26]/10 bg-white p-4 shadow-sm"
                >
                    <div className="w-36">
                        <label className="mb-1 block text-xs font-semibold">
                            Kode PKS
                        </label>
                        <input
                            value={pksForm.data.code}
                            onChange={(e) =>
                                pksForm.setData('code', e.target.value)
                            }
                            placeholder="PKS-LB"
                            required
                            className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                    </div>
                    <div className="min-w-56 flex-1">
                        <label className="mb-1 block text-xs font-semibold">
                            Nama PKS Tujuan
                        </label>
                        <input
                            value={pksForm.data.name}
                            onChange={(e) =>
                                pksForm.setData('name', e.target.value)
                            }
                            placeholder="PKS Lubuk Dalam"
                            required
                            className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                        />
                    </div>
                    <button
                        type="submit"
                        className="min-h-10 rounded-md bg-[#1C5143] px-4 text-xs font-bold text-white"
                    >
                        + Tambah PKS
                    </button>
                </form>
            )}

            <DataTable
                data={pksMills}
                columns={buildPksColumns(canModify)}
                getRowKey={(m) => m.id}
                searchableText={(m) => `${m.code} ${m.name}`}
                searchPlaceholder="Cari kode atau nama PKS..."
            />
        </div>
    );
}
