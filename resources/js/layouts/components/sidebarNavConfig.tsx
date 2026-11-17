import type { ReactNode } from 'react';
import {
    IconAiSpark,
    IconDashboard,
    IconHarvestScale,
    IconMasterGrid,
    IconMillWeigh,
    IconTruckRoute,
    IconUsers,
} from '@/components/ekulap/DuotoneIcons';

export type NavItem = {
    label: string;
    href: string;
    matchPrefix: string;
    icon: ReactNode;
    badge?: number;
};

export function buildSidebarNavItems(
    userRole: string,
    pendingTphLots: number,
): NavItem[] {
    const isKerani = userRole === 'Kerani Produksi';
    const isAdmin = userRole === 'Admin';
    const canSeeMaster =
        userRole === 'Admin' ||
        userRole === 'Supervisi/Asisten' ||
        userRole === 'Pimpinan (EM/RC)';

    const items: NavItem[] = [];

    if (!isKerani) {
        items.push({
            label: 'Dashboard',
            href: '/dashboard',
            matchPrefix: '/dashboard',
            icon: <IconDashboard className="size-5 shrink-0" />,
        });
    }

    items.push(
        {
            label: 'Timbang TPH',
            href: '/tph-harvest',
            matchPrefix: '/tph-harvest',
            icon: <IconHarvestScale className="size-5 shrink-0" />,
            badge: pendingTphLots > 0 ? pendingTphLots : undefined,
        },
        {
            label: 'Surat Jalan (SPB)',
            href: '/surat-jalan',
            matchPrefix: '/surat-jalan',
            icon: <IconTruckRoute className="size-5 shrink-0" />,
        },
        {
            label: 'Status Kutip Lapis',
            href: '/pks-reconciliation',
            matchPrefix: '/pks-reconciliation',
            icon: <IconMillWeigh className="size-5 shrink-0" />,
        },
    );

    if (!isKerani) {
        items.push({
            label: 'Asisten AI Sawit',
            href: '/ai-assistant',
            matchPrefix: '/ai-assistant',
            icon: <IconAiSpark className="size-5 shrink-0" />,
        });
    }

    if (canSeeMaster) {
        items.push({
            label: 'Master Data',
            href: '/master-data',
            matchPrefix: '/master-data',
            icon: <IconMasterGrid className="size-5 shrink-0" />,
        });
    }

    if (isAdmin) {
        items.push({
            label: 'Pengguna',
            href: '/users',
            matchPrefix: '/users',
            icon: <IconUsers className="size-5 shrink-0" />,
        });
    }

    return items;
}
