import { Link } from '@inertiajs/react';
import { BrandLogo } from '@/components/ekulap/BrandLogo';
import { buildSidebarNavItems } from '@/layouts/components/sidebarNavConfig';

type AdminSidebarProps = {
    currentUrl: string;
    collapsed: boolean;
    mobileOpen: boolean;
    pendingTphLots: number;
    userRole: string;
    isAuthenticated: boolean;
    onCloseMobile: () => void;
    onToggleCollapse: () => void;
};

export function AdminSidebar({
    currentUrl,
    collapsed,
    mobileOpen,
    pendingTphLots,
    userRole,
    isAuthenticated,
    onCloseMobile,
    onToggleCollapse,
}: AdminSidebarProps) {
    const navItems = buildSidebarNavItems(userRole, pendingTphLots);
    const homeHref =
        userRole === 'Kerani Produksi' ? '/tph-harvest' : '/dashboard';
    const isCollapsed = collapsed && !mobileOpen;

    const isRouteActive = (prefix: string): boolean => {
        if (
            prefix === '/dashboard' &&
            (currentUrl === '/' || currentUrl.startsWith('/?'))
        ) {
            return true;
        }

        return (
            currentUrl === prefix ||
            currentUrl.startsWith(`${prefix}/`) ||
            currentUrl.startsWith(`${prefix}?`)
        );
    };

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-[#102B26]/65 backdrop-blur-xs lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            <aside
                className={`no-print fixed inset-y-0 left-0 z-50 flex flex-col bg-[#102B26] text-[#E9EEE9] transition-all duration-200 lg:static lg:translate-x-0 ${
                    mobileOpen
                        ? 'w-72 translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                } ${collapsed ? 'lg:w-20' : 'lg:w-68'}`}
            >
                <div className="flex items-center justify-between border-b border-[#E9EEE9]/12 px-4 py-4">
                    <Link href={homeHref} className="block w-full">
                        <BrandLogo collapsed={isCollapsed} variant="sidebar" />
                    </Link>
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="ml-2 rounded-lg p-2 text-[#E9EEE9]/80 hover:bg-[#1C5143] lg:hidden"
                        aria-label="Tutup menu"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
                    {navItems.map((item) => {
                        const active = isRouteActive(item.matchPrefix);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onCloseMobile}
                                title={isCollapsed ? item.label : undefined}
                                className={`ek-btn group relative flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                                    active
                                        ? 'bg-white font-semibold text-[#102B26] shadow-sm'
                                        : 'text-[#98A4A0] hover:bg-[#1F3732]/60 hover:text-[#F6F8F6]'
                                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                            >
                                <span
                                    className={
                                        active
                                            ? 'text-[#1C5143]'
                                            : 'text-[#98A4A0] group-hover:text-[#F6F8F6]'
                                    }
                                >
                                    {item.icon}
                                </span>
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 truncate">
                                            {item.label}
                                        </span>
                                        {item.badge !== undefined && (
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                    active
                                                        ? 'bg-[#E9EEE9] text-[#102B26]'
                                                        : 'border border-[#D6A84F]/45 bg-[#D6A84F]/15 text-[#D6A84F]'
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-[#F6F8F6]/10 p-3">
                    {!collapsed && (
                        <div className="mb-2 rounded-md bg-[#1F3732] px-3 py-2.5 text-xs text-[#F6F8F6]">
                            <div className="font-semibold text-[#D6A84F]">
                                {userRole}
                            </div>
                            <div className="truncate text-[11px] text-[#98A4A0]">
                                Sinarmas Agribusiness
                            </div>
                            {!isAuthenticated && (
                                <Link
                                    href="/login"
                                    className="ek-btn mt-2 inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-[#1C5143] px-2.5 text-xs font-semibold text-[#F6F8F6]"
                                >
                                    Masuk Aplikasi
                                </Link>
                            )}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="ek-btn hidden min-h-10 w-full items-center justify-center rounded-md border border-[#F6F8F6]/14 px-3 py-2 text-xs font-medium text-[#98A4A0] hover:bg-[#1F3732] hover:text-[#F6F8F6] lg:flex"
                    >
                        {collapsed ? '→' : '← Lipat Sidebar'}
                    </button>
                </div>
            </aside>
        </>
    );
}
