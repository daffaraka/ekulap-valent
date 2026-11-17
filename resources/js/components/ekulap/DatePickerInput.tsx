import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type DatePickerInputProps = {
    value: string;
    onChange: (isoDate: string) => void;
    placeholder?: string;
    required?: boolean;
};

const MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function parseIsoDate(iso: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) {
        return new Date();
    }
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function toIsoDate(year: number, monthIndex: number, day: number): string {
    const mm = String(monthIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
}

export function DatePickerInput({
    value,
    onChange,
    placeholder = 'Pilih tanggal',
}: DatePickerInputProps) {
    const selectedDate = value ? parseIsoDate(value) : null;
    const initial = selectedDate ?? new Date();

    const [open, setOpen] = useState<boolean>(false);
    const [viewYear, setViewYear] = useState<number>(initial.getFullYear());
    const [viewMonth, setViewMonth] = useState<number>(initial.getMonth());
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        const handleOutside = (event: MouseEvent): void => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        const handleEscape = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    const today = new Date();
    const todayIso = toIsoDate(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const goMonth = (delta: number): void => {
        const next = new Date(viewYear, viewMonth + delta, 1);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
    };

    const pickDay = (day: number): void => {
        onChange(toIsoDate(viewYear, viewMonth, day));
        setOpen(false);
    };

    const formattedLabel = selectedDate
        ? `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
        : placeholder;

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    const base = value ? parseIsoDate(value) : new Date();
                    setViewYear(base.getFullYear());
                    setViewMonth(base.getMonth());
                    setOpen((prev) => !prev);
                }}
                className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-[#C8D4C8] bg-white px-3 text-left text-xs font-medium text-[#102B26] transition hover:border-[#1C5143] focus:border-[#1C5143] focus:outline-none"
            >
                <span className={value ? 'text-[#102B26]' : 'text-[#5A6C68]'}>
                    {formattedLabel}
                </span>
                <Calendar className="size-4 shrink-0 text-[#1C5143]" />
            </button>

            {open && (
                <div className="absolute top-full left-0 z-50 mt-1.5 w-72 rounded-lg border border-[#CFD9CF] bg-white p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => goMonth(-1)}
                            className="flex size-8 items-center justify-center rounded-md border border-[#E9EEE9] text-[#102B26] hover:bg-[#E9EEE9]"
                            aria-label="Bulan sebelumnya"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <div className="text-xs font-bold text-[#102B26]">
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </div>
                        <button
                            type="button"
                            onClick={() => goMonth(1)}
                            className="flex size-8 items-center justify-center rounded-md border border-[#E9EEE9] text-[#102B26] hover:bg-[#E9EEE9]"
                            aria-label="Bulan berikutnya"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#5A6C68]">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {Array.from({ length: firstWeekday }).map((_, idx) => (
                            <div key={`empty-${idx}`} />
                        ))}
                        {Array.from(
                            { length: daysInMonth },
                            (_, i) => i + 1,
                        ).map((day) => {
                            const iso = toIsoDate(viewYear, viewMonth, day);
                            const isSelected = iso === value;
                            const isToday = iso === todayIso;

                            return (
                                <button
                                    key={iso}
                                    type="button"
                                    onClick={() => pickDay(day)}
                                    className={`flex h-8 items-center justify-center rounded-md text-xs font-medium transition ${
                                        isSelected
                                            ? 'bg-[#1C5143] font-bold text-white'
                                            : isToday
                                              ? 'border border-[#D6A84F] bg-[#D6A84F]/15 font-bold text-[#102B26]'
                                              : 'text-[#102B26] hover:bg-[#E9EEE9]'
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-2.5 flex justify-between border-t border-[#E9EEE9] pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                onChange(todayIso);
                                setOpen(false);
                            }}
                            className="text-[11px] font-semibold text-[#1C5143] hover:underline"
                        >
                            Pilih Hari Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-[11px] font-medium text-[#5A6C68] hover:text-[#102B26]"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
