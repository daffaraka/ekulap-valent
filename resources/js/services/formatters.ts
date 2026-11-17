export function formatKg(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    const numeric = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(numeric)) {
        return '-';
    }

    return `${new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: numeric % 1 === 0 ? 0 : 1,
        maximumFractionDigits: 2,
    }).format(numeric)} Kg`;
}

export function formatNumber(
    value: number | string | null | undefined,
): string {
    const numeric = typeof value === 'string' ? Number(value) : (value ?? 0);
    if (Number.isNaN(numeric)) {
        return '0';
    }

    return new Intl.NumberFormat('id-ID').format(numeric);
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(parsed);
}

export function formatDateOnly(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsed);
}

export function calculateShrinkagePercent(
    estimatedKg: number,
    shrinkageKg: number | null,
): number {
    if (!estimatedKg || shrinkageKg === null) {
        return 0;
    }

    return Number(((shrinkageKg / estimatedKg) * 100).toFixed(2));
}
