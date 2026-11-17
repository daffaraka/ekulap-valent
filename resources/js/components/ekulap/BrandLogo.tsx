type BrandLogoProps = {
    collapsed?: boolean;
    variant?: 'sidebar' | 'light';
};

export function BrandLogo({
    collapsed = false,
    variant = 'sidebar',
}: BrandLogoProps) {
    if (collapsed) {
        return (
            <div className="flex items-center justify-center">
                <div className="flex size-10 items-center justify-center rounded-md bg-white p-1.5">
                    <img
                        src="/images/sinarmas-mark.png"
                        alt="Logo Sinarmas"
                        className="size-full object-contain"
                    />
                </div>
            </div>
        );
    }

    const wrapperClass =
        variant === 'sidebar'
            ? 'rounded-md bg-white px-3 py-2'
            : 'rounded-md border border-[#102B26]/12 bg-white px-3.5 py-2';

    const subtitleClass =
        variant === 'sidebar'
            ? 'text-[11px] leading-snug font-medium text-white'
            : 'text-[11px] leading-snug font-medium text-[#5A6C68]';

    return (
        <div className="flex flex-col gap-1.5">
            <div className={`inline-flex items-center gap-2.5 ${wrapperClass}`}>
                <img
                    src="/images/sinarmas-logo.png"
                    alt="Sinarmas"
                    className="h-6 w-auto object-contain"
                />
            </div>
            <div className="px-0.5">
                <span className={subtitleClass}>
                    Elektronik Kutip Lapis — Monitoring Panen TPH–PKS
                </span>
            </div>
        </div>
    );
}
