import { useEffect, useRef, useState } from 'react';

export type SearchableSelectOption = {
    value: string;
    label: string;
    sublabel?: string;
    searchText?: string;
};

type SearchableSelectProps = {
    value: string;
    options: SearchableSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    onChange: (value: string) => void;
};

export function SearchableSelect({
    value,
    options,
    placeholder = 'Pilih salah satu...',
    searchPlaceholder = 'Ketik untuk mencari...',
    emptyText = 'Data tidak ditemukan.',
    onChange,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find((opt) => opt.value === value);

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

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    setOpen((prev) => !prev);
                    setQuery('');
                }}
                className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-[#C8D4C8] bg-white px-3 text-left text-xs text-[#102B26] hover:border-[#1C5143] focus:border-[#1C5143] focus:outline-none"
            >
                <span className="truncate font-medium">
                    {selected ? selected.label : placeholder}
                </span>
                <span className="shrink-0 text-[10px] text-[#5A6C68]">
                    {open ? '▲' : '▼'}
                </span>
            </button>

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
                    <div className="max-h-52 overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-[#5A6C68]">
                                {emptyText}
                            </div>
                        ) : (
                            filtered.map((opt) => {
                                const active = opt.value === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                            setQuery('');
                                        }}
                                        className={`flex min-h-10 w-full flex-col justify-center rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                                            active
                                                ? 'bg-[#1C5143] font-semibold text-white'
                                                : 'text-[#102B26] hover:bg-[#E9EEE9]/70'
                                        }`}
                                    >
                                        <span className="truncate">
                                            {opt.label}
                                        </span>
                                        {opt.sublabel && (
                                            <span
                                                className={`truncate text-[10px] ${
                                                    active
                                                        ? 'text-white/80'
                                                        : 'text-[#5A6C68]'
                                                }`}
                                            >
                                                {opt.sublabel}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
