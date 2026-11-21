import { Link, router } from '@inertiajs/react';
import { IconAiSpark, IconMenuToggle } from '@/components/ekulap/DuotoneIcons';
import type { User } from '@/types';

type AdminHeaderProps = {
    title: string;
    subtitle?: string;
    user: User | null;
    canUseAi?: boolean;
    isDevelopment?: boolean;
    onOpenMobileMenu: () => void;
    onToggleDesktopSidebar: () => void;
};

function getHeaderTheme(isDevelopment: boolean) {
    if (isDevelopment) {
        return {
            header: 'border-[#102B26]/20 bg-[#1C5143] text-white',
            toggleBtn:
                'border-white/20 bg-white/10 text-white hover:bg-white/20',
            title: 'text-white',
            subtitle: 'text-[#E9EEE9]/85',
            actionBtn:
                'border-white/20 bg-white/12 text-white hover:bg-white/22',
            logoutBtn:
                'border-white/20 bg-white/12 text-white hover:bg-white/22',
            aiSpark: 'text-[#D6A84F]',
            loginBtn: 'bg-white text-[#102B26] hover:bg-[#E9EEE9]',
        };
    }

    return {
        header: 'border-[#102B26]/10 bg-white text-[#102B26]',
        toggleBtn:
            'border-[#102B26]/14 bg-[#F6F8F6] text-[#102B26] hover:bg-[#E9EEE9]',
        title: 'text-[#102B26]',
        subtitle: 'text-[#5A6C68]',
        actionBtn:
            'border-[#102B26]/14 bg-[#F6F8F6] text-[#102B26] hover:bg-[#E9EEE9]',
        logoutBtn:
            'border-[#102B26]/14 bg-white text-[#102B26] hover:bg-[#E9EEE9]',
        aiSpark: 'text-[#1C5143]',
        loginBtn: 'bg-[#1C5143] text-[#F6F8F6] hover:bg-[#102B26]',
    };
}

export function AdminHeader({
    title,
    subtitle,
    user,
    canUseAi = false,
    isDevelopment = false,
    onOpenMobileMenu,
    onToggleDesktopSidebar,
}: AdminHeaderProps) {
    const theme = getHeaderTheme(isDevelopment);
    const handleLogout = (): void => {
        router.post('/logout');
    };

    return (
        <header
            className={`no-print sticky top-0 z-30 border-b px-4 py-3 sm:px-6 ${theme.header}`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenMobileMenu}
                        className={`ek-btn flex size-11 items-center justify-center rounded-md border lg:hidden ${theme.toggleBtn}`}
                        aria-label="Buka navigasi"
                    >
                        <IconMenuToggle className="size-5" />
                    </button>
                    <button
                        type="button"
                        onClick={onToggleDesktopSidebar}
                        className={`ek-btn hidden size-10 items-center justify-center rounded-md border lg:flex ${theme.toggleBtn}`}
                        aria-label="Toggle sidebar"
                    >
                        <IconMenuToggle className="size-5" />
                    </button>
                    <div>
                        <h1
                            className={`text-base font-semibold tracking-tight sm:text-lg ${theme.title}`}
                        >
                            {title}
                        </h1>
                        {subtitle && (
                            <p
                                className={`hidden text-xs sm:block ${theme.subtitle}`}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {canUseAi && (
                        <Link
                            href="/ai-assistant"
                            className={`ek-btn hidden min-h-10 items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold sm:inline-flex ${theme.actionBtn}`}
                        >
                            <IconAiSpark
                                className={`size-4 ${theme.aiSpark}`}
                            />
                            <span>Tanya AI</span>
                        </Link>
                    )}

                    {user ? (
                        <>
                            <div className="hidden text-right md:block">
                                <div
                                    className={`text-xs font-semibold ${theme.title}`}
                                >
                                    {user.name}
                                </div>
                                <div
                                    className={`text-[11px] ${theme.subtitle}`}
                                >
                                    {user.role}
                                    {user.division
                                        ? ` · ${user.division.code}`
                                        : ' · Pusat'}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className={`ek-btn min-h-10 rounded-md border px-3 py-2 text-xs font-semibold ${theme.logoutBtn}`}
                            >
                                Keluar
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className={`ek-btn inline-flex min-h-10 items-center rounded-md px-4 py-2 text-xs font-semibold ${theme.loginBtn}`}
                        >
                            Masuk Petugas
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
