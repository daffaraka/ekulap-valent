import { Link, router } from '@inertiajs/react';
import { IconAiSpark, IconMenuToggle } from '@/components/ekulap/DuotoneIcons';
import type { User } from '@/types';

type AdminHeaderProps = {
    title: string;
    subtitle?: string;
    user: User | null;
    onOpenMobileMenu: () => void;
    onToggleDesktopSidebar: () => void;
};

export function AdminHeader({
    title,
    subtitle,
    user,
    onOpenMobileMenu,
    onToggleDesktopSidebar,
}: AdminHeaderProps) {
    const handleLogout = (): void => {
        router.post('/logout');
    };

    return (
        <header className="no-print sticky top-0 z-30 border-b border-[#102B26]/10 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenMobileMenu}
                        className="ek-btn flex size-11 items-center justify-center rounded-md border border-[#102B26]/14 bg-[#F6F8F6] text-[#102B26] lg:hidden"
                        aria-label="Buka navigasi"
                    >
                        <IconMenuToggle className="size-5" />
                    </button>
                    <button
                        type="button"
                        onClick={onToggleDesktopSidebar}
                        className="ek-btn hidden size-10 items-center justify-center rounded-md border border-[#102B26]/14 bg-[#F6F8F6] text-[#102B26] hover:bg-[#E9EEE9] lg:flex"
                        aria-label="Toggle sidebar"
                    >
                        <IconMenuToggle className="size-5" />
                    </button>
                    <div>
                        <h1 className="text-base font-semibold tracking-tight text-[#102B26] sm:text-lg">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="hidden text-xs text-[#5A6C68] sm:block">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {user?.role !== 'Kerani Produksi' && (
                        <Link
                            href="/ai-assistant"
                            className="ek-btn hidden min-h-10 items-center gap-1.5 rounded-md border border-[#102B26]/14 bg-[#F6F8F6] px-3 py-2 text-xs font-semibold text-[#102B26] hover:bg-[#E9EEE9] sm:inline-flex"
                        >
                            <IconAiSpark className="size-4 text-[#1C5143]" />
                            <span>Tanya AI</span>
                        </Link>
                    )}

                    {user ? (
                        <>
                            <div className="hidden text-right md:block">
                                <div className="text-xs font-semibold text-[#102B26]">
                                    {user.name}
                                </div>
                                <div className="text-[11px] text-[#5A6C68]">
                                    {user.role}
                                    {user.division
                                        ? ` · ${user.division.code}`
                                        : ' · Pusat'}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="ek-btn min-h-10 rounded-md border border-[#102B26]/14 bg-white px-3 py-2 text-xs font-semibold text-[#102B26] hover:bg-[#E9EEE9]"
                            >
                                Keluar
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="ek-btn inline-flex min-h-10 items-center rounded-md bg-[#1C5143] px-4 py-2 text-xs font-semibold text-[#F6F8F6] hover:bg-[#102B26]"
                        >
                            Masuk Petugas
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
