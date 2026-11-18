import { Link } from '@inertiajs/react';
import { BrandLogo } from '@/components/ekulap/BrandLogo';
import {
    buildSidebarNavItems,
    type NavItem,
} from '@/layouts/components/sidebarNavConfig';
import {
    getSidebarTheme,
    type SidebarTheme,
} from '@/layouts/components/sidebarTheme';

type AdminSidebarProps = {
    currentUrl: string;
    collapsed: boolean;
    mobileOpen: boolean;
    pendingTphLots: number;
    userRole: string;
    isAuthenticated: boolean;
    isDevelopment?: boolean;
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
    theme,
    onCloseMobile,
}: {
    item: NavItem;
    active: boolean;
    isCollapsed: boolean;
    theme: SidebarTheme;
    onCloseMobile: () => void;
}) {
    return (
        <Link
            href={item.href}
            onClick={onCloseMobile}
            title={isCollapsed ? item.label : undefined}
            className={`ek-btn group relative flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                active ? theme.navActive : theme.navIdle
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
        >
            <span className={active ? theme.iconActive : theme.iconIdle}>
                {item.icon}
            </span>
            {!isCollapsed && (
                <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                active ? theme.badgeActive : theme.badgeIdle
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
    isDevelopment = false,
    onCloseMobile,
    onToggleCollapse,
}: AdminSidebarProps) {
    const theme = getSidebarTheme(isDevelopment);
    const navItems = buildSidebarNavItems(userRole, pendingTphLots);
    const homeHref =
        userRole === 'Kerani Produksi' ? '/tph-harvest' : '/dashboard';
    const isCollapsed = collapsed && !mobileOpen;

    return (
        <>
            {mobileOpen && (
                <div
                    className={`fixed inset-0 z-40 backdrop-blur-xs lg:hidden ${theme.backdrop}`}
                    onClick={onCloseMobile}
                />
            )}

            <aside
                className={`no-print fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 lg:sticky lg:top-0 lg:bottom-auto lg:left-auto lg:h-screen lg:shrink-0 lg:translate-x-0 lg:self-start ${theme.aside} ${
                    mobileOpen
                        ? 'w-72 translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                } ${collapsed ? 'lg:w-20' : 'lg:w-68'}`}
            >
                <div
                    className={`flex shrink-0 items-center justify-between border-b px-4 py-4 ${theme.headerBorder}`}
                >
                    <Link href={homeHref} className="block w-full">
                        <BrandLogo collapsed={isCollapsed} variant="sidebar" />
                    </Link>
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className={`ml-2 rounded-lg p-2 lg:hidden ${theme.closeBtn}`}
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
                            theme={theme}
                            onCloseMobile={onCloseMobile}
                        />
                    ))}
                </nav>

                <div className={`shrink-0 border-t p-3 ${theme.footerBorder}`}>
                    {!collapsed && (
                        <div
                            className={`mb-2 rounded-md px-3 py-2.5 text-xs ${theme.roleBox}`}
                        >
                            <div className={`font-semibold ${theme.roleTitle}`}>
                                {userRole}
                            </div>
                            <div
                                className={`truncate text-[11px] ${theme.roleSub}`}
                            >
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
                        className={`ek-btn hidden min-h-10 w-full items-center justify-center rounded-md border px-3 py-2 text-xs font-medium lg:flex ${theme.collapseBtn}`}
                    >
                        {collapsed ? '→' : '← Lipat Sidebar'}
                    </button>
                </div>
            </aside>
        </>
    );
}
