import { Link } from '@inertiajs/react';
import { IconAiSpark } from '@/components/ekulap/DuotoneIcons';
import type { AiSnapshot } from '@/types';

type AiAlertStripProps = {
    aiSnapshot: AiSnapshot;
};

export function AiAlertStrip({ aiSnapshot }: AiAlertStripProps) {
    if (aiSnapshot.alerts.length === 0) {
        return null;
    }

    return (
        <section className="rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md border border-[#102B26]/12 bg-[#E9EEE9] text-[#1C5143]">
                        <IconAiSpark className="size-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#102B26]">
                            Ringkasan Audit Operasional AI
                        </h2>
                        <p className="text-xs text-[#5A6C68]">
                            Deteksi otomatis restan karung TPH, deviasi GPS, dan
                            susut timbangan PKS
                        </p>
                    </div>
                </div>

                <Link
                    href="/ai-assistant"
                    className="ek-btn inline-flex min-h-9 items-center rounded-md border border-[#102B26]/14 bg-[#F6F8F6] px-3.5 py-1.5 text-xs font-semibold text-[#102B26] hover:bg-[#E9EEE9]"
                >
                    Asisten AI →
                </Link>
            </div>

            <div className="mt-3.5 grid gap-3 md:grid-cols-3">
                {aiSnapshot.alerts.map((alert) => (
                    <div
                        key={alert.title}
                        className={`rounded-md border border-l-3 border-[#102B26]/10 bg-[#F6F8F6] p-3 text-xs ${
                            alert.severity === 'danger'
                                ? 'border-l-[#9E2A2B]'
                                : 'border-l-[#D6A84F]'
                        }`}
                    >
                        <div className="font-semibold text-[#102B26]">
                            {alert.title}
                        </div>
                        <p className="mt-1 text-[#5A6C68]">{alert.detail}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
