type TphHarvestGpsFieldsProps = {
    inputLatitude: string;
    inputLongitude: string;
    onChangeField: (field: string, value: string) => void;
    onFillMasterGps: () => void;
};

export function TphHarvestGpsFields({
    inputLatitude,
    inputLongitude,
    onChangeField,
    onFillMasterGps,
}: TphHarvestGpsFieldsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <div>
                <label className="mb-1 block text-xs font-semibold">
                    GPS Latitude HP
                </label>
                <input
                    type="text"
                    value={inputLatitude}
                    onChange={(e) =>
                        onChangeField('input_latitude', e.target.value)
                    }
                    className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                />
            </div>
            <div>
                <label className="mb-1 block text-xs font-semibold">
                    GPS Longitude HP
                </label>
                <input
                    type="text"
                    value={inputLongitude}
                    onChange={(e) =>
                        onChangeField('input_longitude', e.target.value)
                    }
                    className="min-h-10 w-full rounded-md border border-[#C8D4C8] px-3 text-xs"
                />
            </div>
            <div className="flex items-end">
                <button
                    type="button"
                    onClick={onFillMasterGps}
                    className="min-h-10 w-full rounded-md border border-[#D6A84F]/60 bg-[#D6A84F]/15 px-3 text-xs font-semibold text-[#102B26]"
                >
                    Samakan GPS Master TPH
                </button>
            </div>
        </div>
    );
}
