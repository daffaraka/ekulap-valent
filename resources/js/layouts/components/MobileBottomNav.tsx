import { Link } from '@inertiajs/react';
import {
    IconAiSpark,
    IconDashboard,
    IconHarvestScale,
    IconMillWeigh,
    IconTruckRoute,
} from '@/components/ekulap/DuotoneIcons';

type MobileBottomNavProps = {
    currentUrl: string;
    userRole: string;
    isDevelopment?: boolean;
};

export function MobileBottomNav({
    currentUrl,
    userRole,
    isDevelopment = false,
}: MobileBottomNavProps) {
    const isKerani = userRole === 'Kerani Produksi';

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

    const tabs = isKerani
        ? [
              {
                  label: 'TPH',
                  href: '/tph-harvest',
                  icon: <IconHarvestScale className="size-5" />,
              },
              {
                  label: 'SPB',
                  href: '/surat-jalan',
                  icon: <IconTruckRoute className="size-5" />,
              },
              {
                  label: 'Kutip Lapis',
                  href: '/pks-reconciliation',
                  icon: <IconMillWeigh className="size-5" />,
              },
          ]
        : [
              {
                  label: 'Beranda',
                  href: '/dashboard',
                  icon: <IconDashboard className="size-5" />,
              },
              {
                  label: 'TPH',
                  href: '/tph-harvest',
                  icon: <IconHarvestScale className="size-5" />,
              },
              {
                  label: 'SPB',
                  href: '/surat-jalan',
                  icon: <IconTruckRoute className="size-5" />,
              },
              {
                  label: 'Kutip Lapis',
                  href: '/pks-reconciliation',
                  icon: <IconMillWeigh className="size-5" />,
              },
              {
                  label: 'AI',
                  href: '/ai-assistant',
                  icon: <IconAiSpark className="size-5" />,
              },
          ];

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
