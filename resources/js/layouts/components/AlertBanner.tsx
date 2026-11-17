import { useState } from 'react';
import type { FlashMessages } from '@/types';

type AlertBannerProps = {
    flash?: FlashMessages;
};

export function AlertBanner({ flash }: AlertBannerProps) {
    const [dismissedText, setDismissedText] = useState<string | null>(null);

    const activeMessage = flash?.error ?? flash?.success ?? null;
    if (!activeMessage || activeMessage === dismissedText) {
        return null;
    }

    const isError = Boolean(flash?.error);

    return (
        <div
            className={`no-print mb-4 flex items-center justify-between gap-3 rounded-md border bg-white px-4 py-3 text-sm font-medium ${
                isError
                    ? 'border-l-4 border-[#102B26]/12 border-l-[#9E2A2B] text-[#8C2323]'
                    : 'border-l-4 border-[#102B26]/12 border-l-[#1C5143] text-[#102B26]'
            }`}
        >
            <span>{activeMessage}</span>
            <button
                type="button"
                onClick={() => setDismissedText(activeMessage)}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-[#5A6C68] hover:bg-[#E9EEE9] hover:text-[#102B26]"
            >
                Tutup
            </button>
        </div>
    );
}
