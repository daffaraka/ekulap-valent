import { Link } from '@inertiajs/react';
import { BrandLogo } from '@/components/ekulap/BrandLogo';
import {
    buildSidebarNavItems,
    type NavItem,
} from '@/layouts/components/sidebarNavConfig';

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

function isRouteActive(currentUrl: string, prefix: string): boolean {
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
}

function SidebarNavItem({
    item,
    active,
    isCollapsed,
    onCloseMobile,
}: {
    item: NavItem;
    active: boolean;
    isCollapsed: boolean;
    onCloseMobile: () => void;
}) {
    return (
        <Link
            href={item.href}
            onClick={onCloseMobile}
            title={isCollapsed ? item.label : undefined}
            className={`ek-btn group relative flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                active
                    ? 'border-l-4 border-[#D6A84F] bg-white font-semibold text-[#5D420B] shadow-sm'
                    : 'text-[#EDE4D3]/85 hover:bg-[#4A3408]/80 hover:text-white'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
        >
            <span
                className={
                    active
                        ? 'text-[#5D420B]'
                        : 'text-[#EDE4D3]/80 group-hover:text-white'
                }
            >
                {item.icon}
            </span>
            {!isCollapsed && (
                <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                active
                                    ? 'bg-[#5D420B]/12 text-[#5D420B]'
                                    : 'border border-[#D6A84F]/55 bg-[#D6A84F]/20 text-[#F5D78E]'
                            }`}
                        >
                            {item.badge}
                        </span>
                    )}
                </>
            )}
        </Link>
    );
}

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

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-[#2B1E04]/65 backdrop-blur-xs lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            <aside
                className={`no-print fixed inset-y-0 left-0 z-50 flex flex-col bg-[#5D420B] text-[#FAF6EE] transition-all duration-200 lg:sticky lg:top-0 lg:bottom-auto lg:left-auto lg:h-screen lg:shrink-0 lg:translate-x-0 lg:self-start ${
                    mobileOpen
                        ? 'w-72 translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                } ${collapsed ? 'lg:w-20' : 'lg:w-68'}`}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-white/14 px-4 py-4">
                    <Link href={homeHref} className="block w-full">
                        <BrandLogo collapsed={isCollapsed} variant="sidebar" />
                    </Link>
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="ml-2 rounded-lg p-2 text-[#FAF6EE]/80 hover:bg-[#4A3408] lg:hidden"
                        aria-label="Tutup menu"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
                    {navItems.map((item) => (
                        <SidebarNavItem
                            key={item.href}
                            item={item}
                            active={isRouteActive(currentUrl, item.matchPrefix)}
                            isCollapsed={isCollapsed}
                            onCloseMobile={onCloseMobile}
                        />
                    ))}
                </nav>

                <div className="shrink-0 border-t border-white/12 p-3">
                    {!collapsed && (
                        <div className="mb-2 rounded-md bg-[#4A3408] px-3 py-2.5 text-xs text-[#FAF6EE]">
                            <div className="font-semibold text-[#F5D78E]">
                                {userRole}
                            </div>
                            <div className="truncate text-[11px] text-[#EDE4D3]/80">
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
                        className="ek-btn hidden min-h-10 w-full items-center justify-center rounded-md border border-white/18 px-3 py-2 text-xs font-medium text-[#EDE4D3]/85 hover:bg-[#4A3408] hover:text-white lg:flex"
                    >
                        {collapsed ? '→' : '← Lipat Sidebar'}
                    </button>
                </div>
            </aside>
        </>
    );
}
