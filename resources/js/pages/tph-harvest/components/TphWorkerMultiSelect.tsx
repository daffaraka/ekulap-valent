import { useState } from 'react';
import InputError from '@/components/input-error';
import type { Worker } from '@/types';

type TphWorkerMultiSelectProps = {
    workers: Worker[];
    selectedIds: number[];
    error?: string;
    onChange: (nextIds: number[]) => void;
};

export function TphWorkerMultiSelect({
    workers,
    selectedIds,
    error,
    onChange,
}: TphWorkerMultiSelectProps) {
    const [filter, setFilter] = useState<string>('');

    const toggleWorker = (workerId: number): void => {
        if (selectedIds.includes(workerId)) {
            onChange(selectedIds.filter((id) => id !== workerId));
            return;
        }
        onChange([...selectedIds, workerId]);
    };

    const filteredWorkers = workers.filter((worker) => {
        const keyword = filter.trim().toLowerCase();
        if (!keyword) {
            return true;
        }
        return (
            worker.name.toLowerCase().includes(keyword) ||
            worker.worker_code.toLowerCase().includes(keyword) ||
            worker.job_type.toLowerCase().includes(keyword)
        );
    });

    return (
        <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-[#102B26]">
                    Tenaga Kerja (Bisa pilih lebih dari 1)
                </label>
                <span className="rounded-full bg-[#1C5143]/12 px-2.5 py-0.5 text-[11px] font-bold text-[#1C5143]">
                    {selectedIds.length} Terpilih
                </span>
            </div>

            <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Cari nama atau kode pekerja..."
                className="mb-2 min-h-10 w-full rounded-md border border-[#C8D4C8] bg-[#E9EEE9]/35 px-3 text-xs text-[#102B26] focus:border-[#1C5143] focus:bg-white focus:outline-none"
            />

            <div className="grid max-h-40 gap-1.5 overflow-y-auto rounded-md border border-[#C8D4C8] bg-[#F6F8F6] p-2 sm:grid-cols-2">
                {filteredWorkers.map((worker) => {
                    const checked = selectedIds.includes(worker.id);
                    return (
                        <label
                            key={worker.id}
                            className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md border px-2.5 py-1.5 text-xs transition ${
                                checked
                                    ? 'border-[#1C5143] bg-[#1C5143]/10 font-semibold text-[#102B26]'
                                    : 'border-[#E9EEE9] bg-white text-[#466059] hover:border-[#C8D4C8]'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleWorker(worker.id)}
                                className="size-4 shrink-0 accent-[#1C5143]"
                            />
                            <div className="min-w-0">
                                <div className="truncate font-semibold text-[#102B26]">
                                    {worker.name}
                                </div>
                                <div className="truncate text-[10px] text-[#5A6C68]">
                                    {worker.worker_code} · {worker.job_type}
                                </div>
                            </div>
                        </label>
                    );
                })}
                {filteredWorkers.length === 0 && (
                    <div className="col-span-full py-3 text-center text-xs text-[#5A6C68]">
                        Tidak ada tenaga kerja yang sesuai pencarian.
                    </div>
                )}
            </div>

            <InputError message={error} className="mt-1" />
        </div>
    );
}
