import type { FormEvent } from 'react';
import { useState } from 'react';
import { IconAiSpark } from '@/components/ekulap/DuotoneIcons';

type ChatMessage = {
    id: number;
    sender: 'user' | 'assistant';
    text: string;
    meta?: string;
};

type AiChatPanelProps = {
    suggestedPrompts: string[];
    providerConfigured: boolean;
    activeProvider: string | null;
};

export function AiChatPanel({
    suggestedPrompts,
    providerConfigured,
    activeProvider,
}: AiChatPanelProps) {
    const [question, setQuestion] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            sender: 'assistant',
            text: 'Halo! Saya Asisten AI eKULAP bertenaga Laravel AI SDK. Pilih pertanyaan cepat di samping atau ketik pertanyaan operasional seputar restan karung TPH, susut timbangan PKS, deviasi GPS, atau kinerja pemanen.',
            meta: providerConfigured
                ? `Provider LLM Aktif: ${activeProvider}`
                : 'Mode Analitik Lokal (laravel/ai Tools aktif — tambah GEMINI_API_KEY / OPENAI_API_KEY di .env untuk mode LLM live)',
        },
    ]);

    const sendQuestion = async (text: string): Promise<void> => {
        const trimmed = text.trim();
        if (!trimmed || loading) {
            return;
        }

        const userMsg: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: trimmed,
        };
        setMessages((prev) => [...prev, userMsg]);
        setQuestion('');
        setLoading(true);

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') ?? '';

            const response = await fetch('/ai-assistant/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ question: trimmed }),
            });

            const payload = (await response.json()) as {
                answer?: string;
                provider?: string;
                used_tools?: string[];
            };

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'assistant',
                    text:
                        payload.answer ??
                        'Tidak ada jawaban yang dikembalikan oleh agen AI.',
                    meta: `${payload.provider ?? 'Laravel AI'} • Tools: ${(payload.used_tools ?? []).join(', ')}`,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'assistant',
                    text: 'Terjadi kendala saat menghubungi layanan Asisten AI.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (event: FormEvent): void => {
        event.preventDefault();
        void sendQuestion(question);
    };

    return (
        <div className="grid gap-5 lg:grid-cols-12">
            <div className="min-w-0 space-y-3 rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm lg:col-span-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#102B26]">
                    <IconAiSpark className="size-4 text-[#1C5143]" />
                    <span>Pertanyaan Cepat Audit</span>
                </div>
                <div className="space-y-2">
                    {suggestedPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            disabled={loading}
                            onClick={() => void sendQuestion(prompt)}
                            className="min-h-11 w-full rounded-md border border-[#CFD9CF] bg-[#E9EEE9]/55 p-3 text-left text-xs font-medium text-[#102B26] transition hover:border-[#1C5143] hover:bg-[#1C5143]/10 disabled:opacity-60"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex min-w-0 flex-col rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm lg:col-span-8">
                <div
                    className="flex-1 space-y-3 overflow-y-auto pr-1"
                    style={{ maxHeight: '420px' }}
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`rounded-lg p-4 text-xs leading-relaxed ${
                                msg.sender === 'user'
                                    ? 'ml-auto max-w-[85%] bg-[#1C5143] text-white'
                                    : 'mr-auto max-w-[95%] border border-[#CFD9CF] bg-[#E9EEE9]/60 text-[#102B26]'
                            }`}
                        >
                            <div className="whitespace-pre-line">
                                {msg.text}
                            </div>
                            {msg.meta && (
                                <div className="mt-2 border-t border-[#CFD9CF]/70 pt-1.5 text-[10px] font-semibold text-[#466059]">
                                    {msg.meta}
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="rounded-lg border border-[#CFD9CF] bg-[#E9EEE9]/45 p-3 text-xs text-[#466059]">
                            Asisten AI sedang memanggil Tools database eKULAP...
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 flex gap-2 border-t border-[#E9EEE9] pt-4"
                >
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Tanyakan soal karung belum diangkut, susut PKS, atau GPS..."
                        className="min-h-11 flex-1 rounded-md border border-[#C8D4C8] bg-[#E9EEE9]/40 px-3.5 text-xs focus:border-[#1C5143] focus:bg-white focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className="min-h-11 rounded-md bg-[#1C5143] px-5 text-xs font-bold text-white transition hover:bg-[#102B26] disabled:opacity-60"
                    >
                        Kirim
                    </button>
                </form>
            </div>
        </div>
    );
}
