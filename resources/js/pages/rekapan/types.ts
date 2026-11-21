export type RekapanLotItem = {
    id: number;
    lot_number: string;
    division_code: string;
    block_code: string;
    tph_code: string;
    harvest_type: string;
    worker_names: string;
    weigher_name: string;
    sack_count: number;
    tph_count: number;
    net_weight_kg: number;
    loaded_sack_count: number;
    remaining_sacks: number;
    restan_days: number;
    transport_status: string;
};

export type RekapanDailyRow = {
    work_date: string;
    lot_count: number;
    tph_count: number;
    total_sacks: number;
    total_net_kg: number;
    loaded_sacks: number;
    remaining_sacks: number;
    restan_days: number;
    divisions: string[];
    blocks: string[];
    workers: string[];
    weighers: string[];
    records: RekapanLotItem[];
};

export type StationAgeBucket = {
    days: number;
    sacks: number;
    lot_count: number;
};

export type StationRestanLot = {
    id: number;
    lot_number: string;
    work_date: string;
    division_code: string;
    block_code: string;
    tph_code: string;
    harvest_type: string;
    worker_names: string;
    weigher_name: string;
    sack_count: number;
    unloaded_sacks: number;
    belum_muat_sacks: number;
    restan_sacks: number;
    restan_net_kg: number;
    restan_days: number;
    transport_status: string;
};

export type RekapanStationRow = {
    tph_point_id: number;
    tph_code: string;
    location_label: string;
    division_codes: string[];
    block_codes: string[];
    worker_names: string[];
    weigher_names: string[];
    lot_count: number;
    restan_sacks: number;
    unloaded_sacks: number;
    belum_muat_sacks: number;
    restan_net_kg: number;
    oldest_work_date: string;
    max_restan_days: number;
    age_breakdown: StationAgeBucket[];
    records: StationRestanLot[];
};

export type RekapanTotals = {
    days_count: number;
    lot_count: number;
    tph_count: number;
    total_sacks: number;
    total_net_kg: number;
    loaded_sacks: number;
    remaining_sacks: number;
    belum_muat_spb_sacks: number;
    max_restan_days: number;
    cumulative_restan_days: number;
    pending_station_count: number;
};

export type RekapanFilters = {
    tab: string;
    date_from: string;
    date_to: string;
    division_id: number | null;
};
