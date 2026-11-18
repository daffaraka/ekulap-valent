import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export type DataTableColumn<T> = {
    key: string;
    header: string;
    align?: 'left' | 'right' | 'center';
    headerClassName?: string;
    cellClassName?: string;
    sortValue?: (row: T) => string | number | null | undefined;
    render: (row: T) => ReactNode;
};

export type ServerPaginationMeta = {
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export function filterAndSortRows<T>(
    rows: T[],
    searchQuery: string,
    searchableText: ((row: T) => string) | undefined,
    sortColumn: DataTableColumn<T> | undefined,
    sortDirection: SortDirection,
): T[] {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered =
        normalizedQuery !== '' && searchableText
            ? rows.filter((row) =>
                  searchableText(row).toLowerCase().includes(normalizedQuery),
              )
            : rows;

    if (!sortColumn?.sortValue || !sortDirection) {
        return filtered;
    }

    const extract = sortColumn.sortValue;
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    return [...filtered].sort((a, b) => {
        const valA = extract(a);
        const valB = extract(b);

        if (valA === null || valA === undefined) {
            return valB === null || valB === undefined ? 0 : 1;
        }
        if (valB === null || valB === undefined) {
            return -1;
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * multiplier;
        }

        return (
            String(valA).localeCompare(String(valB), 'id', {
                numeric: true,
                sensitivity: 'base',
            }) * multiplier
        );
    });
}
