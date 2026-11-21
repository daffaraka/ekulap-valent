import type { ReactNode } from 'react';
import {
    IconAiSpark,
    IconDailyRecap,
    IconDashboard,
    IconHarvestScale,
    IconMasterGrid,
    IconMillWeigh,
    IconRoleKey,
    IconShieldMonitor,
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

export function resolveHomeHref(permissions: string[]): string {
    const candidates: Array<{ permission: string; href: string }> = [
        { permission: 'dashboard.view', href: '/dashboard' },
        { permission: 'tph-harvest.view', href: '/tph-harvest' },
        { permission: 'surat-jalan.view', href: '/surat-jalan' },
        { permission: 'pks-reconciliation.view', href: '/pks-reconciliation' },
        { permission: 'rekapan.view', href: '/rekapan-kutip-lapis' },
        { permission: 'ai-assistant.use', href: '/ai-assistant' },
        { permission: 'master-data.view', href: '/master-data' },
        { permission: 'users.view', href: '/users' },
        { permission: 'roles.view', href: '/roles' },
        { permission: 'system-monitor.view', href: '/system-monitor' },
    ];

    return (
        candidates.find((item) => permissions.includes(item.permission))
            ?.href ?? '/dashboard'
    );
}

export function buildSidebarNavItems(
    permissions: string[],
    pendingTphLots: number,
): NavItem[] {
    const has = (permission: string): boolean =>
        permissions.includes(permission);

    const items: NavItem[] = [];

    if (has('dashboard.view')) {
        items.push({
            label: 'Dashboard',
            href: '/dashboard',
            matchPrefix: '/dashboard',
            icon: <IconDashboard className="size-5 shrink-0" />,
        });
    }

    if (has('tph-harvest.view')) {
        items.push({
            label: 'Timbang TPH',
            href: '/tph-harvest',
            matchPrefix: '/tph-harvest',
            icon: <IconHarvestScale className="size-5 shrink-0" />,
            badge: pendingTphLots > 0 ? pendingTphLots : undefined,
        });
    }

    if (has('surat-jalan.view')) {
        items.push({
            label: 'Surat Jalan (SPB)',
            href: '/surat-jalan',
            matchPrefix: '/surat-jalan',
            icon: <IconTruckRoute className="size-5 shrink-0" />,
        });
    }

    if (has('pks-reconciliation.view')) {
        items.push({
            label: 'Status Kutip Lapis',
            href: '/pks-reconciliation',
            matchPrefix: '/pks-reconciliation',
            icon: <IconMillWeigh className="size-5 shrink-0" />,
        });
    }

    if (has('rekapan.view')) {
        items.push({
            label: 'Rekapan Kutip Lapis',
            href: '/rekapan-kutip-lapis',
            matchPrefix: '/rekapan-kutip-lapis',
            icon: <IconDailyRecap className="size-5 shrink-0" />,
        });
    }

    if (has('ai-assistant.use')) {
        items.push({
            label: 'Asisten AI Sawit',
            href: '/ai-assistant',
            matchPrefix: '/ai-assistant',
            icon: <IconAiSpark className="size-5 shrink-0" />,
        });
    }

    if (has('master-data.view')) {
        items.push({
            label: 'Master Data',
            href: '/master-data',
            matchPrefix: '/master-data',
            icon: <IconMasterGrid className="size-5 shrink-0" />,
        });
    }

    if (has('users.view')) {
        items.push({
            label: 'Pengguna',
            href: '/users',
            matchPrefix: '/users',
            icon: <IconUsers className="size-5 shrink-0" />,
        });
    }

    if (has('roles.view')) {
        items.push({
            label: 'Role & Akses',
            href: '/roles',
            matchPrefix: '/roles',
            icon: <IconRoleKey className="size-5 shrink-0" />,
        });
    }

    if (has('system-monitor.view')) {
        items.push({
            label: 'Monitor Sistem',
            href: '/system-monitor',
            matchPrefix: '/system-monitor',
            icon: <IconShieldMonitor className="size-5 shrink-0" />,
        });
    }

    return items;
}
