import { useEffect, useRef, useState } from 'react';
import type { SearchableSelectOption } from '@/components/ekulap/SearchableSelect';

type SearchableMultiSelectProps = {
    values: string[];
    options: SearchableSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    itemPluralLabel?: string;
    onChange: (values: string[]) => void;
};

export function SearchableMultiSelect({
    values,
    options,
    placeholder = 'Pilih minimal 1 opsi...',
    searchPlaceholder = 'Ketik untuk mencari...',
    emptyText = 'Data tidak ditemukan.',
    itemPluralLabel = 'dipilih',
    onChange,
}: SearchableMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter((opt) => values.includes(opt.value));

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
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [open]);

    const normalized = query.trim().toLowerCase();
    const filtered = normalized
        ? options.filter((opt) => {
              const target =
                  opt.searchText ?? `${opt.label} ${opt.sublabel ?? ''}`;
              return target.toLowerCase().includes(normalized);
          })
        : options;

    const toggleValue = (val: string): void => {
        if (values.includes(val)) {
            onChange(values.filter((item) => item !== val));
            return;
        }
        onChange([...values, val]);
    };

    const triggerSummary =
        selectedOptions.length === 0
            ? placeholder
            : selectedOptions.length <= 2
              ? selectedOptions.map((opt) => opt.label).join(', ')
              : `${selectedOptions.length} ${itemPluralLabel}`;

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    setOpen((prev) => !prev);
                    setQuery('');
                }}
                className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-[#C8D4C8] bg-white px-3 text-left text-xs text-[#102B26] hover:border-[#1C5143] focus:border-[#1C5143] focus:outline-none"
            >
                <span className="truncate font-medium">{triggerSummary}</span>
                <span className="shrink-0 text-[10px] text-[#5A6C68]">
                    {open ? '▲' : '▼'}
                </span>
            </button>

            {selectedOptions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {selectedOptions.map((opt) => (
                        <span
                            key={opt.value}
                            className="inline-flex items-center gap-1 rounded-md bg-[#1C5143]/12 px-2 py-0.5 text-[11px] font-semibold text-[#1C5143]"
                        >
                            <span>{opt.label}</span>
                            <button
                                type="button"
                                onClick={() => toggleValue(opt.value)}
                                aria-label={`Hapus ${opt.label}`}
                                className="rounded px-0.5 text-[#1C5143]/80 hover:bg-[#1C5143]/15 hover:text-[#102B26]"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {open && (
                <div className="absolute right-0 left-0 z-40 mt-1 overflow-hidden rounded-lg border border-[#C8D4C8] bg-white shadow-lg">
                    <div className="border-b border-[#E9EEE9] bg-[#F6F8F6] p-2">
                        <input
                            type="search"
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setOpen(false);
                                }
                            }}
                            placeholder={searchPlaceholder}
                            className="min-h-9 w-full rounded-md border border-[#C8D4C8] bg-white px-2.5 text-xs text-[#102B26] focus:border-[#1C5143] focus:outline-none"
                        />
                    </div>
                    <div className="max-h-52 space-y-0.5 overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-[#5A6C68]">
                                {emptyText}
                            </div>
                        ) : (
                            filtered.map((opt) => {
                                const checked = values.includes(opt.value);
                                return (
                                    <label
                                        key={opt.value}
                                        className={`flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                                            checked
                                                ? 'bg-[#1C5143]/10 font-semibold text-[#102B26]'
                                                : 'text-[#102B26] hover:bg-[#E9EEE9]/70'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                                toggleValue(opt.value)
                                            }
                                            className="size-4 shrink-0 accent-[#1C5143]"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate">
                                                {opt.label}
                                            </span>
                                            {opt.sublabel && (
                                                <span className="block truncate text-[10px] font-normal text-[#5A6C68]">
                                                    {opt.sublabel}
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
