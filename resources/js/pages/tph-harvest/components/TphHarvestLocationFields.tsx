import { DatePickerInput } from '@/components/ekulap/DatePickerInput';
import InputError from '@/components/input-error';
import { TphHarvestGpsFields } from '@/pages/tph-harvest/components/TphHarvestGpsFields';
import type { Block, TphPoint, WeigherOption } from '@/types';

type TphHarvestLocationFieldsProps = {
    workDate: string;
    harvestType: string;
    blockId: string;
    tphPointId: string;
    weigherUserId: string;
    sackCount: string;
    tphCount: string;
    grossWeightKg: string;
    inputLatitude: string;
    inputLongitude: string;
    blocks: Block[];
    filteredTphPoints: TphPoint[];
    weighers: WeigherOption[];
    harvestTypes: string[];
    errors: Record<string, string | undefined>;
    onChangeField: (field: string, value: string) => void;
    onBlockChange: (nextBlockId: string) => void;
    onFillMasterGps: () => void;
};

export function TphHarvestLocationFields({
    workDate,
    harvestType,
    blockId,
    tphPointId,
    weigherUserId,
    sackCount,
    tphCount,
    grossWeightKg,
    inputLatitude,
    inputLongitude,
    blocks,
    filteredTphPoints,
    weighers,
    harvestTypes,
    errors,
    onChangeField,
    onBlockChange,
    onFillMasterGps,
}: TphHarvestLocationFieldsProps) {
    return (
        <>
            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Tanggal Kerja
                    </label>
                    <DatePickerInput
                        value={workDate}
                        onChange={(iso) => onChangeField('work_date', iso)}
                        required
                    />
                    <InputError message={errors.work_date} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Jenis Hasil
                    </label>
                    <select
                        value={harvestType}
                        onChange={(e) =>
                            onChangeField('harvest_type', e.target.value)
                        }
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        {harvestTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.harvest_type} />
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Blok
                    </label>
                    <select
                        value={blockId}
                        onChange={(e) => onBlockChange(e.target.value)}
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        {blocks.map((block) => (
                            <option key={block.id} value={block.id}>
                                Blok {block.code}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.block_id} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Titik TPH (Lokasi Terkunci)
                    </label>
                    <select
                        value={tphPointId}
                        onChange={(e) =>
                            onChangeField('tph_point_id', e.target.value)
                        }
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        {filteredTphPoints.map((tph) => (
                            <option key={tph.id} value={tph.id}>
                                {tph.code}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.tph_point_id} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Petugas Timbang
                    </label>
                    <select
                        value={weigherUserId}
                        onChange={(e) =>
                            onChangeField('weigher_user_id', e.target.value)
                        }
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    >
                        {weighers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.username ?? user.role})
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.weigher_user_id} />
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Jumlah Karung
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={sackCount}
                        onChange={(e) =>
                            onChangeField('sack_count', e.target.value)
                        }
                        required
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    />
                    <InputError message={errors.sack_count} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Jumlah TPH
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={tphCount}
                        onChange={(e) =>
                            onChangeField('tph_count', e.target.value)
                        }
                        required
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    />
                    <InputError message={errors.tph_count} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Berat Timbang (Kg)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min={1}
                        value={grossWeightKg}
                        onChange={(e) =>
                            onChangeField('gross_weight_kg', e.target.value)
                        }
                        required
                        className="min-h-11 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                    />
                    <InputError message={errors.gross_weight_kg} />
                </div>
            </div>

            <TphHarvestGpsFields
                inputLatitude={inputLatitude}
                inputLongitude={inputLongitude}
                onChangeField={onChangeField}
                onFillMasterGps={onFillMasterGps}
            />
        </>
    );
}
