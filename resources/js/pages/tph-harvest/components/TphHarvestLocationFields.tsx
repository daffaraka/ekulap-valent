import { DatePickerInput } from '@/components/ekulap/DatePickerInput';
import { SearchableMultiSelect } from '@/components/ekulap/SearchableMultiSelect';
import { SearchableSelect } from '@/components/ekulap/SearchableSelect';
import InputError from '@/components/input-error';
import { TphHarvestGpsFields } from '@/pages/tph-harvest/components/TphHarvestGpsFields';
import type { Block, TphPoint, WeigherOption } from '@/types';

type TphHarvestLocationFieldsProps = {
    workDate: string;
    harvestType: string;
    blockIds: number[];
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
    onBlocksChange: (nextBlockIds: number[]) => void;
    onFillMasterGps: () => void;
};

export function TphHarvestLocationFields({
    workDate,
    harvestType,
    blockIds,
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
    onBlocksChange,
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
                        Blok (Bisa pilih lebih dari 1)
                    </label>
                    <SearchableMultiSelect
                        values={blockIds.map(String)}
                        onChange={(nextValues) =>
                            onBlocksChange(nextValues.map(Number))
                        }
                        placeholder="Pilih minimal 1 blok..."
                        searchPlaceholder="Cari kode blok..."
                        emptyText="Blok tidak ditemukan."
                        itemPluralLabel="Blok dipilih"
                        options={blocks.map((block) => ({
                            value: String(block.id),
                            label: `Blok ${block.code}`,
                            sublabel: block.planting_year
                                ? `Tahun Tanam ${block.planting_year}`
                                : undefined,
                            searchText: `${block.code} Blok ${block.code}`,
                        }))}
                    />
                    <InputError message={errors.block_ids ?? errors.block_id} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Titik TPH / Stasiun Brondol
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
                                {tph.code} — {tph.location_label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.tph_point_id} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">
                        Petugas Timbang
                    </label>
                    <SearchableSelect
                        value={weigherUserId}
                        onChange={(nextId) =>
                            onChangeField('weigher_user_id', nextId)
                        }
                        placeholder="Pilih petugas timbang..."
                        searchPlaceholder="Cari nama / NIK petugas..."
                        emptyText="Petugas tidak ditemukan."
                        options={weighers.map((user) => ({
                            value: String(user.id),
                            label: `${user.name} (${user.username ?? user.role})`,
                            sublabel: user.role,
                            searchText: `${user.name} ${user.username ?? ''} ${user.role}`,
                        }))}
                    />
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
