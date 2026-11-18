export type SidebarTheme = {
    backdrop: string;
    aside: string;
    headerBorder: string;
    closeBtn: string;
    navActive: string;
    navIdle: string;
    iconActive: string;
    iconIdle: string;
    badgeActive: string;
    badgeIdle: string;
    footerBorder: string;
    roleBox: string;
    roleTitle: string;
    roleSub: string;
    collapseBtn: string;
};

export function getSidebarTheme(isDevelopment: boolean): SidebarTheme {
    if (isDevelopment) {
        return {
            backdrop: 'bg-[#2B1E04]/65',
            aside: 'bg-[#5D420B] text-[#FAF6EE]',
            headerBorder: 'border-white/14',
            closeBtn: 'text-[#FAF6EE]/80 hover:bg-[#4A3408]',
            navActive:
                'border-l-4 border-[#D6A84F] bg-white font-semibold text-[#5D420B] shadow-sm',
            navIdle: 'text-[#EDE4D3]/85 hover:bg-[#4A3408]/80 hover:text-white',
            iconActive: 'text-[#5D420B]',
            iconIdle: 'text-[#EDE4D3]/80 group-hover:text-white',
            badgeActive: 'bg-[#5D420B]/12 text-[#5D420B]',
            badgeIdle:
                'border border-[#D6A84F]/55 bg-[#D6A84F]/20 text-[#F5D78E]',
            footerBorder: 'border-white/12',
            roleBox: 'bg-[#4A3408] text-[#FAF6EE]',
            roleTitle: 'text-[#F5D78E]',
            roleSub: 'text-[#EDE4D3]/80',
            collapseBtn:
                'border-white/18 text-[#EDE4D3]/85 hover:bg-[#4A3408] hover:text-white',
        };
    }

    return {
        backdrop: 'bg-[#102B26]/65',
        aside: 'bg-[#102B26] text-[#E9EEE9]',
        headerBorder: 'border-[#E9EEE9]/12',
        closeBtn: 'text-[#E9EEE9]/80 hover:bg-[#1C5143]',
        navActive:
            'border-l-4 border-[#1C5143] bg-white font-semibold text-[#102B26] shadow-sm',
        navIdle: 'text-[#98A4A0] hover:bg-[#1F3732]/60 hover:text-[#F6F8F6]',
        iconActive: 'text-[#1C5143]',
        iconIdle: 'text-[#98A4A0] group-hover:text-[#F6F8F6]',
        badgeActive: 'bg-[#E9EEE9] text-[#102B26]',
        badgeIdle: 'border border-[#D6A84F]/45 bg-[#D6A84F]/15 text-[#D6A84F]',
        footerBorder: 'border-[#F6F8F6]/10',
        roleBox: 'bg-[#1F3732] text-[#F6F8F6]',
        roleTitle: 'text-[#D6A84F]',
        roleSub: 'text-[#98A4A0]',
        collapseBtn:
            'border-[#F6F8F6]/14 text-[#98A4A0] hover:bg-[#1F3732] hover:text-[#F6F8F6]',
    };
}
