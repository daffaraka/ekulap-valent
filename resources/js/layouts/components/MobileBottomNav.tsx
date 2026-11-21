import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    IconAiSpark,
    IconDailyRecap,
    IconDashboard,
    IconHarvestScale,
    IconMillWeigh,
    IconTruckRoute,
} from '@/components/ekulap/DuotoneIcons';

type MobileBottomNavProps = {
    currentUrl: string;
    permissions: string[];
    isDevelopment?: boolean;
};

type MobileTab = {
    permission: string;
    label: string;
    href: string;
    icon: ReactNode;
};

const ALL_MOBILE_TABS: MobileTab[] = [
    {
        permission: 'dashboard.view',
        label: 'Beranda',
        href: '/dashboard',
        icon: <IconDashboard className="size-5" />,
    },
    {
        permission: 'tph-harvest.view',
        label: 'TPH',
        href: '/tph-harvest',
        icon: <IconHarvestScale className="size-5" />,
    },
    {
        permission: 'surat-jalan.view',
        label: 'SPB',
        href: '/surat-jalan',
        icon: <IconTruckRoute className="size-5" />,
    },
    {
        permission: 'pks-reconciliation.view',
        label: 'Kutip Lapis',
        href: '/pks-reconciliation',
        icon: <IconMillWeigh className="size-5" />,
    },
    {
        permission: 'ai-assistant.use',
        label: 'AI',
        href: '/ai-assistant',
        icon: <IconAiSpark className="size-5" />,
    },
    {
        permission: 'rekapan.view',
        label: 'Rekapan',
        href: '/rekapan-kutip-lapis',
        icon: <IconDailyRecap className="size-5" />,
    },
];

export function MobileBottomNav({
    currentUrl,
    permissions,
    isDevelopment = false,
}: MobileBottomNavProps) {
    const navTheme = isDevelopment
        ? {
              bar: 'border-[#4A3408] bg-[#5D420B] text-[#EDE4D3]/85',
              active: 'bg-white font-semibold text-[#5D420B] shadow-sm',
              idle: 'text-[#EDE4D3]/80 hover:text-white',
          }
        : {
              bar: 'border-[#102B26]/12 bg-[#102B26] text-[#98A4A0]',
              active: 'bg-white font-semibold text-[#102B26] shadow-sm',
              idle: 'text-[#98A4A0] hover:text-[#F6F8F6]',
          };

    const tabs = ALL_MOBILE_TABS.filter((tab) =>
        permissions.includes(tab.permission),
    ).slice(0, 5);

    if (tabs.length === 0) {
        return null;
    }

    return (
        <nav
            className={`no-print fixed inset-x-0 bottom-0 z-30 flex border-t px-1 py-1.5 md:hidden ${navTheme.bar}`}
        >
            {tabs.map((tab) => {
                const active =
                    (tab.href === '/dashboard' &&
                        (currentUrl === '/' || currentUrl.startsWith('/?'))) ||
                    currentUrl === tab.href ||
                    currentUrl.startsWith(`${tab.href}/`) ||
                    currentUrl.startsWith(`${tab.href}?`);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[11px] font-medium transition ${
                            active ? navTheme.active : navTheme.idle
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
