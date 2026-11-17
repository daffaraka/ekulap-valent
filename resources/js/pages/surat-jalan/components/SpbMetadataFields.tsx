import InputError from '@/components/input-error';
import { formatKg } from '@/services/formatters';
import type { Division, PksMill, Truck } from '@/types';

type SpbMetadataFieldsProps = {
    divisionId: string;
    truckId: string;
    pksMillId: string;
    deliveryStatus: 'Belum Muat' | 'Sudah Dikirim';
    notes: string;
    divisions: Division[];
    trucks: Truck[];
    pksMills: PksMill[];
    notesError?: string;
    onDivisionChange: (value: string) => void;
    onTruckChange: (value: string) => void;
    onPksMillChange: (value: string) => void;
    onStatusChange: (value: 'Belum Muat' | 'Sudah Dikirim') => void;
    onNotesChange: (value: string) => void;
};

export function SpbMetadataFields({
    divisionId,
    truckId,
    pksMillId,
    deliveryStatus,
    notes,
    divisions,
    trucks,
    pksMills,
    notesError,
    onDivisionChange,
    onTruckChange,
    onPksMillChange,
    onStatusChange,
    onNotesChange,
}: SpbMetadataFieldsProps) {
    return (
        <>
            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Divisi Asal
                    </label>
                    <select
                        value={divisionId}
                        onChange={(e) => onDivisionChange(e.target.value)}
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        {divisions.map((div) => (
                            <option key={div.id} value={div.id}>
                                {div.code} — {div.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Truk &amp; Supir Pengangkut
                    </label>
                    <select
                        value={truckId}
                        onChange={(e) => onTruckChange(e.target.value)}
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        {trucks.map((truck) => (
                            <option key={truck.id} value={truck.id}>
                                {truck.plate_number} · {truck.driver_name} (Max{' '}
                                {formatKg(truck.capacity_kg)})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        PKS Tujuan
                    </label>
                    <select
                        value={pksMillId}
                        onChange={(e) => onPksMillChange(e.target.value)}
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        {pksMills.map((mill) => (
                            <option key={mill.id} value={mill.id}>
                                {mill.code} — {mill.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Status SPB
                    </label>
                    <select
                        value={deliveryStatus}
                        onChange={(e) =>
                            onStatusChange(
                                e.target.value as
                                    | 'Belum Muat'
                                    | 'Sudah Dikirim',
                            )
                        }
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        <option value="Belum Muat">Belum Muat</option>
                        <option value="Sudah Dikirim">Sudah Dikirim</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold">
                    Keterangan (Tujuan / Ke SPB Mana)
                </label>
                <input
                    type="text"
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Contoh: Pengangkutan menuju SPB Ramp PKS Sei Mangkei / Rujukan SPB-..."
                    className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                />
                <InputError message={notesError} />
            </div>
        </>
    );
}
