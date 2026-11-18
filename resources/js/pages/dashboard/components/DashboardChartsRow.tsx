import { useState } from 'react';
import type { StatusBreakdownItem } from '@/pages/dashboard/components/FlowPipelineBanner';
import { formatKg, formatNumber } from '@/services/formatters';

type DashboardChartsRowProps = {
    breakdown: StatusBreakdownItem[];
    totalSacks: number;
};

type ChartSegment = StatusBreakdownItem & {
    color: string;
    fraction: number;
    percent: number;
    startAngle: number;
    endAngle: number;
};

const SEGMENT_COLORS: Record<string, string> = {
    'Belum Diangkut': '#D6A84F',
    'Diangkut Sebagian': '#7A8C85',
    'Sudah Diangkut': '#1C5143',
};

const CHART_CENTER = 70;
const CHART_RADIUS = 52;
const FULL_CIRCLE_THRESHOLD = 0.9999;

function polarToCartesian(
    cx: number,
    cy: number,
    radius: number,
    angleInRadians: number,
): { x: number; y: number } {
    return {
        x: cx + radius * Math.cos(angleInRadians),
        y: cy + radius * Math.sin(angleInRadians),
    };
}

function describeDonutArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
): string {
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

function buildChartSegments(
    breakdown: StatusBreakdownItem[],
    totalSacks: number,
): ChartSegment[] {
    let currentAngle = -Math.PI / 2;

    return breakdown
        .filter((item) => item.status !== 'Sudah Masuk PKS')
        .map((item) => {
            const fraction = totalSacks > 0 ? item.sack_count / totalSacks : 0;
            const sweepAngle = fraction * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sweepAngle;
            currentAngle = endAngle;

            return {
                ...item,
                color: SEGMENT_COLORS[item.status] ?? '#1C5143',
                fraction,
                percent: Math.round(fraction * 100),
                startAngle,
                endAngle,
            };
        });
}

function DonutShape({
    segment,
    strokeWidth,
    strokeOpacity,
    className,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    interactive = false,
}: {
    segment: ChartSegment;
    strokeWidth: number;
    strokeOpacity: number;
    className: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    interactive?: boolean;
}) {
    const commonProps = {
        fill: 'none' as const,
        stroke: segment.color,
        strokeWidth,
        strokeOpacity,
        className,
        ...(interactive
            ? {
                  tabIndex: 0,
                  'aria-label': `${segment.status}: ${formatNumber(segment.sack_count)} karung (${segment.percent}%)`,
                  onMouseEnter,
                  onMouseLeave,
                  onFocus,
                  onBlur,
              }
            : {}),
    };

    if (segment.fraction >= FULL_CIRCLE_THRESHOLD) {
        return (
            <circle
                cx={CHART_CENTER}
                cy={CHART_CENTER}
                r={CHART_RADIUS}
                {...commonProps}
            />
        );
    }

    return (
        <path
            d={describeDonutArc(
                CHART_CENTER,
                CHART_CENTER,
                CHART_RADIUS,
                segment.startAngle,
                segment.endAngle,
            )}
            strokeLinecap="butt"
            {...commonProps}
        />
    );
}

function DonutChartTooltip({ segment }: { segment: ChartSegment }) {
    return (
        <div
            role="status"
            className="pointer-events-none absolute -top-2 left-1/2 z-10 w-max max-w-[min(85vw,18rem)] -translate-x-1/2 -translate-y-full rounded-lg border border-[#102B26]/15 bg-[#102B26] px-3 py-1.5 text-center text-[11px] text-white shadow-md"
        >
            <div className="flex items-center justify-center gap-1.5 font-semibold">
                <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                />
                <span>{segment.status}</span>
            </div>
            <div className="mt-0.5 text-white/85">
                {formatNumber(segment.sack_count)} Karung ({segment.percent}%) ·{' '}
                {formatKg(segment.net_weight_kg)}
            </div>
        </div>
    );
}

function DonutChartGraphic({
    segments,
    totalSacks,
    hoveredStatus,
    onHoverStatus,
}: {
    segments: ChartSegment[];
    totalSacks: number;
    hoveredStatus: string | null;
    onHoverStatus: (status: string | null) => void;
}) {
    const activeSegment =
        segments.find((seg) => seg.status === hoveredStatus) ?? null;
    const hasHover = activeSegment !== null;

    return (
        <div
            className="relative flex size-40 shrink-0 items-center justify-center"
            onMouseLeave={() => onHoverStatus(null)}
        >
            {activeSegment && <DonutChartTooltip segment={activeSegment} />}

            <svg
                viewBox="0 0 140 140"
                className="size-full overflow-visible"
                aria-label="Grafik Distribusi Status Karung"
            >
                <circle
                    cx={CHART_CENTER}
                    cy={CHART_CENTER}
                    r={CHART_RADIUS}
                    fill="none"
                    stroke="#E9EEE9"
                    strokeWidth="16"
                />

                {activeSegment && activeSegment.sack_count > 0 && (
                    <DonutShape
                        segment={activeSegment}
                        strokeWidth={28}
                        strokeOpacity={0.2}
                        className="pointer-events-none transition-all duration-200"
                    />
                )}

                {segments.map((seg) => {
                    if (seg.sack_count <= 0) {
                        return null;
                    }

                    const isHovered = seg.status === hoveredStatus;

                    return (
                        <DonutShape
                            key={seg.status}
                            segment={seg}
                            interactive
                            strokeWidth={isHovered ? 21 : hasHover ? 14 : 16}
                            strokeOpacity={hasHover && !isHovered ? 0.28 : 1}
                            className="cursor-pointer transition-all duration-200 focus:outline-none"
                            onMouseEnter={() => onHoverStatus(seg.status)}
                            onMouseLeave={() => onHoverStatus(null)}
                            onFocus={() => onHoverStatus(seg.status)}
                            onBlur={() => onHoverStatus(null)}
                        />
                    );
                })}
            </svg>

            <div className="pointer-events-none absolute text-center">
                <div className="text-lg font-semibold text-[#102B26] transition-colors duration-150">
                    {formatNumber(
                        activeSegment ? activeSegment.sack_count : totalSacks,
                    )}
                </div>
                <div className="text-[11px] font-medium text-[#5A6C68]">
                    {activeSegment
                        ? `${activeSegment.percent}% · Karung`
                        : 'Karung'}
                </div>
            </div>
        </div>
    );
}

function StatusBreakdownCard({
    segment,
    isHovered,
    isDimmed,
    onHoverStatus,
}: {
    segment: ChartSegment;
    isHovered: boolean;
    isDimmed: boolean;
    onHoverStatus: (status: string | null) => void;
}) {
    const stateClasses = isHovered
        ? 'bg-white shadow-sm ring-1 ring-[#102B26]/10'
        : isDimmed
          ? 'border-[#102B26]/8 bg-[#F6F8F6] opacity-55'
          : 'border-[#102B26]/8 bg-[#F6F8F6]';

    return (
        <div
            tabIndex={0}
            onMouseEnter={() => onHoverStatus(segment.status)}
            onMouseLeave={() => onHoverStatus(null)}
            onFocus={() => onHoverStatus(segment.status)}
            onBlur={() => onHoverStatus(null)}
            style={isHovered ? { borderColor: segment.color } : undefined}
            className={`flex cursor-pointer flex-col justify-between rounded-lg border p-3 text-xs transition-all duration-200 focus:outline-none ${stateClasses}`}
        >
            <div className="flex items-center gap-2">
                <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                />
                <span className="font-semibold text-[#102B26]">
                    {segment.status}
                </span>
            </div>
            <div className="mt-2 text-lg font-bold text-[#102B26]">
                {formatNumber(segment.sack_count)} Karung{' '}
                <span className="text-xs font-medium text-[#5A6C68]">
                    ({segment.percent}%)
                </span>
            </div>
            <div className="mt-0.5 text-[11px] text-[#5A6C68]">
                {formatKg(segment.net_weight_kg)} · {segment.lot_count} Lot
            </div>
        </div>
    );
}

export function DashboardChartsRow({
    breakdown,
    totalSacks,
}: DashboardChartsRowProps) {
    const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
    const segments = buildChartSegments(breakdown, totalSacks);
    const hasHover = hoveredStatus !== null;

    return (
        <section className="rounded-lg border border-[#102B26]/10 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-base font-semibold tracking-tight text-[#102B26]">
                        Distribusi Status Karung
                    </h2>
                    <p className="text-xs text-[#5A6C68]">
                        Proporsi karung aktif di TPH hingga dimuat ke angkutan
                        truk
                    </p>
                </div>
                <span className="rounded-md bg-[#F6F8F6] px-3 py-1 text-xs font-semibold text-[#102B26]">
                    Total {formatNumber(totalSacks)} Karung
                </span>
            </div>

            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
                <DonutChartGraphic
                    segments={segments}
                    totalSacks={totalSacks}
                    hoveredStatus={hoveredStatus}
                    onHoverStatus={setHoveredStatus}
                />

                <div className="grid w-full gap-2.5 sm:grid-cols-3">
                    {segments.map((seg) => (
                        <StatusBreakdownCard
                            key={seg.status}
                            segment={seg}
                            isHovered={seg.status === hoveredStatus}
                            isDimmed={hasHover && seg.status !== hoveredStatus}
                            onHoverStatus={setHoveredStatus}
                        />
                    ))}
                </div>
            </div>

            {/* Perbandingan Estimasi Kebun vs Netto PKS dikomentari sesuai revisi */}
        </section>
    );
}
