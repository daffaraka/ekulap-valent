type StatusBadgeProps = {
    status: string;
};

const DOT_COLOR_MAP: Record<string, string> = {
    'Belum Diangkut': 'bg-[#D6A84F]',
    'Diangkut Sebagian': 'bg-amber-500',
    'Sudah Diangkut': 'bg-emerald-600',
    'Sudah Masuk PKS': 'bg-emerald-700',
    'Belum Muat': 'bg-[#D6A84F]',
    'Sudah Dikirim': 'bg-[#1C5143]',
    Aktif: 'bg-[#1C5143]',
    Nonaktif: 'bg-[#9E2A2B]',
};

const BADGE_TONE_MAP: Record<string, string> = {
    'Sudah Diangkut': 'border-emerald-300 bg-emerald-100 text-emerald-900',
    'Sudah Masuk PKS': 'border-emerald-300 bg-emerald-100 text-emerald-900',
    'Diangkut Sebagian': 'border-amber-300 bg-yellow-100 text-amber-900',
    Nonaktif: 'border-[#9E2A2B]/25 bg-[#9E2A2B]/6 text-[#8C2323]',
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const dotClass = DOT_COLOR_MAP[status] ?? 'bg-[#5A6C68]';
    const badgeTone =
        BADGE_TONE_MAP[status] ??
        'border-[#102B26]/14 bg-[#F6F8F6] text-[#102B26]';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badgeTone}`}
        >
            <span className={`size-1.5 shrink-0 rounded-full ${dotClass}`} />
            <span>{status}</span>
        </span>
    );
}
