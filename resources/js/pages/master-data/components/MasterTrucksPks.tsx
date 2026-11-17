import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { formatKg } from '@/services/formatters';
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

                <div className="overflow-x-auto rounded-lg border border-[#102B26]/10 bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#102B26]/10 bg-[#E9EEE9]/70 text-[#5A6C68]">
                            <tr>
                                <th className="px-4 py-3 font-semibold">
                                    Nomor Polisi
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Nama Supir
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    No. HP / WhatsApp
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Kapasitas Muat
                                </th>
                                {canModify && (
                                    <th className="px-4 py-3 text-right font-semibold">
                                        Aksi
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E9EEE9]">
                            {trucks.map((truck) => (
                                <tr key={truck.id}>
                                    <td className="px-4 py-3 font-bold">
                                        {truck.plate_number}
                                    </td>
                                    <td className="px-4 py-3">
                                        {truck.driver_name}
                                    </td>
                                    <td className="px-4 py-3">
                                        {truck.driver_phone}
                                    </td>
                                    <td className="px-4 py-3 font-semibold">
                                        {formatKg(truck.capacity_kg)}
                                    </td>
                                    {canModify && (
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.delete(
                                                        `/master-data/trucks/${truck.id}`,
                                                    )
                                                }
                                                className="text-[11px] font-semibold text-[#8C2323]"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

            <div className="overflow-x-auto rounded-lg border border-[#102B26]/10 bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#102B26]/10 bg-[#E9EEE9]/70 text-[#5A6C68]">
                        <tr>
                            <th className="px-4 py-3 font-semibold">
                                Kode PKS
                            </th>
                            <th className="px-4 py-3 font-semibold">
                                Nama Pabrik Tujuan
                            </th>
                            {canModify && (
                                <th className="px-4 py-3 text-right font-semibold">
                                    Aksi
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9EEE9]">
                        {pksMills.map((mill) => (
                            <tr key={mill.id}>
                                <td className="px-4 py-3 font-bold">
                                    {mill.code}
                                </td>
                                <td className="px-4 py-3">{mill.name}</td>
                                {canModify && (
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.delete(
                                                    `/master-data/pks-mills/${mill.id}`,
                                                )
                                            }
                                            className="text-[11px] font-semibold text-[#8C2323]"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
