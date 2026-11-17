type StatusBadgeProps = {
    status: string;
};

const DOT_COLOR_MAP: Record<string, string> = {
    'Belum Diangkut': 'bg-[#D6A84F]',
    'Diangkut Sebagian': 'bg-[#5A6C68]',
    'Sudah Diangkut': 'bg-[#1C5143]',
    'Sudah Masuk PKS': 'bg-[#102B26]',
    'Belum Muat': 'bg-[#D6A84F]',
    'Sudah Dikirim': 'bg-[#1C5143]',
    Aktif: 'bg-[#1C5143]',
    Nonaktif: 'bg-[#9E2A2B]',
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const dotClass = DOT_COLOR_MAP[status] ?? 'bg-[#5A6C68]';
    const isInactive = status === 'Nonaktif';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
                isInactive
                    ? 'border-[#9E2A2B]/25 bg-[#9E2A2B]/6 text-[#8C2323]'
                    : 'border-[#102B26]/14 bg-[#F6F8F6] text-[#102B26]'
            }`}
        >
            <span className={`size-1.5 shrink-0 rounded-full ${dotClass}`} />
            <span>{status}</span>
        </span>
    );
}
