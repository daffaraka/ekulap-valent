import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { AdminHeader } from '@/layouts/components/AdminHeader';
import { AdminSidebar } from '@/layouts/components/AdminSidebar';
import { AlertBanner } from '@/layouts/components/AlertBanner';
import { MobileBottomNav } from '@/layouts/components/MobileBottomNav';
import type { FlashMessages, User } from '@/types';

type SharedPageProps = {
    auth?: { user: User | null };
    flash?: FlashMessages;
    pendingTphLots?: number;
    isDevelopment?: boolean;
};

type AdminLayoutProps = {
    title: string;
    subtitle?: string;
    children: ReactNode;
};

export default function AdminLayout({
    title,
    subtitle,
    children,
}: AdminLayoutProps) {
    const page = usePage<SharedPageProps>();
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);

    const user = page.props.auth?.user ?? null;
    const pendingTphLots = page.props.pendingTphLots ?? 0;
    const isDevelopment = Boolean(page.props.isDevelopment);

    return (
        <div className="flex min-h-screen overflow-x-clip bg-[#F6F8F6] text-[#102B26]">
            <Head title={title} />

            <AdminSidebar
                currentUrl={page.url}
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                pendingTphLots={pendingTphLots}
                userRole={user?.role ?? 'Tinjauan Dashboard'}
                isAuthenticated={Boolean(user)}
                onCloseMobile={() => setMobileOpen(false)}
                onToggleCollapse={() => setCollapsed((prev) => !prev)}
            />

            <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
                <AdminHeader
                    title={title}
                    subtitle={subtitle}
                    user={user}
                    isDevelopment={isDevelopment}
                    onOpenMobileMenu={() => setMobileOpen(true)}
                    onToggleDesktopSidebar={() => setCollapsed((prev) => !prev)}
                />

                <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 p-4 sm:p-6">
                    <AlertBanner flash={page.props.flash} />
                    {children}
                </main>
            </div>

            <MobileBottomNav
                currentUrl={page.url}
                userRole={user?.role ?? 'Tinjauan Dashboard'}
            />
        </div>
    );
}
