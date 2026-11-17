import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function IconDashboard({ className = 'size-5', ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
            <rect
                x="3"
                y="3"
                width="8"
                height="9"
                rx="2"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="13"
                y="3"
                width="8"
                height="5"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="13"
                y="10"
                width="8"
                height="11"
                rx="2"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="3"
                y="14"
                width="8"
                height="7"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
        </svg>
    );
}

export function IconHarvestScale({
    className = 'size-5',
    ...props
}: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
            <path
                d="M5 10C5 7.79 6.79 6 9 6H15C17.21 6 19 7.79 19 10V18C19 19.66 17.66 21 16 21H8C6.34 21 5 19.66 5 18V10Z"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M9 13H15M9 16.5H13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function IconTruckRoute({ className = 'size-5', ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
            <path
                d="M3 6C3 4.9 3.9 4 5 4H14V16H3V6Z"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="M14 8H18.2L21 11.2V16H14V8Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <circle
                cx="7.5"
                cy="18"
                r="2"
                fill="currentColor"
                fillOpacity="0.25"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <circle
                cx="17.5"
                cy="18"
                r="2"
                fill="currentColor"
                fillOpacity="0.25"
                stroke="currentColor"
                strokeWidth="1.6"
            />
        </svg>
    );
}

export function IconMillWeigh({ className = 'size-5', ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
            <path
                d="M4 20V9L9 12V9L14 12V5H20V20H4Z"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="M8 16H16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function IconAiSpark({ className = 'size-5', ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
            <path
                d="M12 3L14.3 9.7L21 12L14.3 14.3L12 21L9.7 14.3L3 12L9.7 9.7L12 3Z"
                fill="currentColor"
                fillOpacity="0.22"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <circle cx="18.5" cy="5.5" r="1.5" fill="currentColor" />
        </svg>
    );
}

export function IconMasterGrid({ className = 'size-5', ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
            <path
                d="M4 5C4 3.9 4.9 3 6 3H18C19.1 3 20 3.9 20 5V9H4V5Z"
                fill="currentColor"
                fillOpacity="0.22"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M4 15H20M10 9V21"
                stroke="currentColor"
                strokeWidth="1.6"
            />
        </svg>
    );
}

export function IconUsers({ className = 'size-5', ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
            <circle
                cx="9.5"
                cy="8"
                r="3.2"
                fill="currentColor"
                fillOpacity="0.22"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M4 19C4 15.96 6.46 13.5 9.5 13.5C12.54 13.5 15 15.96 15 19"
                fill="currentColor"
                fillOpacity="0.14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M16.5 10.5C18.16 10.5 19.5 9.16 19.5 7.5M17 14C19.21 14.3 20.5 16.05 20.5 18.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function IconMenuToggle({ className = 'size-5', ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
            <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2.5"
                fill="currentColor"
                fillOpacity="0.12"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path d="M9 4V20" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}

export function IconCoconutPalm({ className = 'size-6', ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
            <path
                d="M12 10.5C12 14.5 11.2 18 10.2 21H13.8C12.8 18 12 14.5 12 10.5Z"
                fill="currentColor"
                fillOpacity="0.22"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="M12 9.5C9.5 6.8 6 6.4 3.5 8.2C6 9 8.5 9.8 12 9.5Z"
                fill="currentColor"
                fillOpacity="0.22"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="M12 9.5C14.5 6.8 18 6.4 20.5 8.2C18 9 15.5 9.8 12 9.5Z"
                fill="currentColor"
                fillOpacity="0.22"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="M12 9.5C9.5 4.8 10.5 3 12 2.5C13.5 3 14.5 4.8 12 9.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="M12 9.5C8.5 10.2 6 12.2 4.8 14.5M12 9.5C15.5 10.2 18 12.2 19.2 14.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <circle cx="10.4" cy="11.2" r="1.3" fill="currentColor" />
            <circle cx="13.6" cy="11.2" r="1.3" fill="currentColor" />
            <path
                d="M7 21H17"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}
