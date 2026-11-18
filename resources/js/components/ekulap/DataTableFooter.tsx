import { router } from '@inertiajs/react';
import type { ServerPaginationMeta } from '@/components/ekulap/dataTableUtils';

type DataTableFooterProps = {
    totalFiltered: number;
    visibleCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    serverPagination?: ServerPaginationMeta;
};

export function DataTableFooter({
    totalFiltered,
    visibleCount,
    currentPage,
    pageSize,
    totalPages,
    onPageChange,
    serverPagination,
}: DataTableFooterProps) {
    if (serverPagination) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#102B26]/10 px-4 py-3 text-xs">
                <span className="text-[#5A6C68]">
                    Menampilkan {visibleCount} data di halaman{' '}
                    {serverPagination.current_page} dari{' '}
                    {serverPagination.last_page} (Total {serverPagination.total}{' '}
                    data)
                </span>
                {serverPagination.links.length > 3 && (
                    <div className="flex flex-wrap gap-1.5">
                        {serverPagination.links.map((link, idx) => (
                            <button
                                key={idx}
                                type="button"
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) {
                                        router.visit(link.url, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }
                                }}
                                className={`min-h-8 rounded-md px-2.5 text-xs font-medium ${
                                    link.active
                                        ? 'bg-[#1C5143] font-semibold text-white'
                                        : 'border border-[#C8D4C8] bg-white text-[#102B26] hover:bg-[#F6F8F6] disabled:opacity-40'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const startIdx = totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIdx = Math.min(currentPage * pageSize, totalFiltered);

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#102B26]/10 px-4 py-3 text-xs">
            <span className="text-[#5A6C68]">
                Menampilkan {startIdx}–{endIdx} dari {totalFiltered} data
            </span>
            {totalPages > 1 && (
                <div className="flex flex-wrap items-center gap-1">
                    <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="min-h-8 rounded-md border border-[#C8D4C8] bg-white px-2.5 text-xs text-[#102B26] hover:bg-[#F6F8F6] disabled:opacity-40"
                    >
                        « Sebelumnya
                    </button>
                    <span className="px-2 font-medium text-[#102B26]">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="min-h-8 rounded-md border border-[#C8D4C8] bg-white px-2.5 text-xs text-[#102B26] hover:bg-[#F6F8F6] disabled:opacity-40"
                    >
                        Berikutnya »
                    </button>
                </div>
            )}
        </div>
    );
}
