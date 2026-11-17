import AdminLayout from '@/layouts/AdminLayout';
import { AiChatPanel } from '@/pages/ai-assistant/components/AiChatPanel';
import { AiSnapshotCards } from '@/pages/ai-assistant/components/AiSnapshotCards';
import type { AiSnapshot } from '@/types';

type AiAssistantWorkspaceProps = {
    snapshot: AiSnapshot;
    suggestedPrompts: string[];
};

export default function AiAssistantWorkspace({
    snapshot,
    suggestedPrompts,
}: AiAssistantWorkspaceProps) {
    return (
        <AdminLayout
            title="Asisten AI Sawit eKULAP"
            subtitle="Didukung Laravel AI SDK (EkulapAnalystAgent) dengan akses real-time ke 10 tabel operasional"
        >
            <div className="space-y-5">
                <AiSnapshotCards snapshot={snapshot} />
                <AiChatPanel
                    suggestedPrompts={suggestedPrompts}
                    providerConfigured={snapshot.provider_configured}
                    activeProvider={snapshot.active_provider}
                />
            </div>
        </AdminLayout>
    );
}
