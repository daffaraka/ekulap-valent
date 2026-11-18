import { Fragment, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DataTableFooter } from '@/components/ekulap/DataTableFooter';
import { filterAndSortRows } from '@/components/ekulap/dataTableUtils';
import type {
    DataTableColumn,
    ServerPaginationMeta,
    SortDirection,
} from '@/components/ekulap/dataTableUtils';

type DataTableProps<T> = {
    data: T[];
    columns: DataTableColumn<T>[];
    getRowKey: (row: T) => string | number;
    searchableText?: (row: T) => string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    defaultPageSize?: number;
    showSearch?: boolean;
    showPageSize?: boolean;
    rowClassName?: (row: T) => string;
    isRowExpanded?: (row: T) => boolean;
    renderExpandedRow?: (row: T) => ReactNode;
    serverPagination?: ServerPaginationMeta;
};

export function DataTable<T>({
    data,
    columns,
    getRowKey,
    searchableText,
    searchPlaceholder = 'Cari di tabel...',
    emptyMessage = 'Belum ada data tersedia.',
    defaultPageSize = 10,
    showSearch = true,
    showPageSize = true,
    rowClassName,
    isRowExpanded,
    renderExpandedRow,
    serverPagination,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDirection>(null);

    const activeSortColumn = useMemo(
        () => columns.find((col) => col.key === sortKey),
        [columns, sortKey],
    );

    const processedRows = useMemo(
        () =>
            filterAndSortRows(
                data,
                searchQuery,
                searchableText,
                activeSortColumn,
                sortDir,
            ),
        [data, searchQuery, searchableText, activeSortColumn, sortDir],
    );

    const totalPages = serverPagination
        ? 1
        : Math.max(1, Math.ceil(processedRows.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    const visibleRows = serverPagination
        ? processedRows
        : processedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

    const handleSort = (col: DataTableColumn<T>): void => {
        if (!col.sortValue) {
            return;
        }
        if (sortKey !== col.key) {
            setSortKey(col.key);
            setSortDir('asc');
        } else if (sortDir === 'asc') {
            setSortDir('desc');
        } else {
            setSortKey(null);
            setSortDir(null);
        }
        setCurrentPage(1);
    };

    const showToolbar =
        (!serverPagination && showPageSize) ||
        (showSearch && Boolean(searchableText));

    return (
        <div className="overflow-hidden rounded-lg border border-[#102B26]/10 bg-white shadow-sm">
            {showToolbar && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#102B26]/10 bg-[#F6F8F6]/70 px-4 py-2.5 text-xs">
                    {!serverPagination && showPageSize ? (
                        <div className="flex items-center gap-2 text-[#5A6C68]">
                            <span>Tampilkan</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="min-h-8 rounded-md border border-[#C8D4C8] bg-white px-2 text-xs font-medium text-[#102B26]"
                            >
                                {[10, 25, 50, 100].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <span>baris</span>
                        </div>
                    ) : (
                        <div />
                    )}

                    {showSearch && searchableText && (
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder={searchPlaceholder}
                            className="min-h-8 w-full rounded-md border border-[#C8D4C8] bg-white px-3 text-xs text-[#102B26] sm:w-64"
                        />
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#102B26]/10 bg-[#F6F8F6] text-[#5A6C68]">
                        <tr>
                            {columns.map((col) => {
                                const isSorted = sortKey === col.key;
                                const alignClass =
                                    col.align === 'right'
                                        ? 'text-right'
                                        : col.align === 'center'
                                          ? 'text-center'
                                          : 'text-left';

                                return (
                                    <th
                                        key={col.key}
                                        className={`px-4 py-3 font-semibold ${alignClass} ${col.headerClassName ?? ''}`}
                                    >
                                        {col.sortValue ? (
                                            <button
                                                type="button"
                                                onClick={() => handleSort(col)}
                                                className="inline-flex items-center gap-1 hover:text-[#102B26]"
                                            >
                                                <span>{col.header}</span>
                                                <span className="text-[10px] opacity-75">
                                                    {isSorted &&
                                                    sortDir === 'asc'
                                                        ? '↑'
                                                        : isSorted &&
                                                            sortDir === 'desc'
                                                          ? '↓'
                                                          : '↕'}
                                                </span>
                                            </button>
                                        ) : (
                                            col.header
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#102B26]/10">
                        {visibleRows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center text-xs text-[#5A6C68]"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            visibleRows.map((row) => {
                                const customRowClass =
                                    rowClassName?.(row) ?? '';

                                return (
                                    <Fragment key={getRowKey(row)}>
                                        <tr
                                            className={
                                                customRowClass !== ''
                                                    ? customRowClass
                                                    : 'hover:bg-[#F6F8F6]/70'
                                            }
                                        >
                                            {columns.map((col) => {
                                                const alignClass =
                                                    col.align === 'right'
                                                        ? 'text-right'
                                                        : col.align === 'center'
                                                          ? 'text-center'
                                                          : 'text-left';

                                                return (
                                                    <td
                                                        key={col.key}
                                                        className={`px-4 py-3 ${alignClass} ${col.cellClassName ?? ''}`}
                                                    >
                                                        {col.render(row)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                        {renderExpandedRow &&
                                            isRowExpanded?.(row) && (
                                                <tr className="bg-[#F6F8F6]/60">
                                                    <td
                                                        colSpan={columns.length}
                                                        className="px-4 pt-1 pb-3"
                                                    >
                                                        {renderExpandedRow(row)}
                                                    </td>
                                                </tr>
                                            )}
                                    </Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <DataTableFooter
                totalFiltered={processedRows.length}
                visibleCount={visibleRows.length}
                currentPage={safePage}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                serverPagination={serverPagination}
            />
        </div>
    );
}
