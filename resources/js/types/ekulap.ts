export type UserRole =
    | 'Admin'
    | 'Kerani Produksi'
    | 'Supervisi/Asisten'
    | 'Pimpinan (EM/RC)'
    | 'Supir'
    | 'Checker PKS';

export type RecordStatus = 'Aktif' | 'Nonaktif';

export type WorkerJobType = 'Pemanen TBS' | 'Kutip Lapis Brondolan';

export type HarvestType = 'Brondolan' | 'Kutip Lapis' | 'TBS';

export type TransportStatus =
    | 'Belum Diangkut'
    | 'Diangkut Sebagian'
    | 'Sudah Diangkut'
    | 'Sudah Masuk PKS';

export type DeliveryStatus = 'Belum Muat' | 'Sudah Dikirim';

export type Division = {
    id: number;
    code: string;
    name: string;
    blocks_count?: number;
    workers_count?: number;
    total_sacks?: number | string | null;
    loaded_sacks?: number | string | null;
    total_net_kg?: number | string | null;
};

export type Block = {
    id: number;
    division_id: number;
    code: string;
    planting_year: number;
    division?: Division;
    tph_points_count?: number;
};

export type TphPoint = {
    id: number;
    block_id: number;
    code: string;
    location_label: string;
    latitude: number;
    longitude: number;
    block?: Block;
};

export type Worker = {
    id: number;
    division_id: number;
    worker_code: string;
    name: string;
    job_type: WorkerJobType;
    status: RecordStatus;
    division?: Division;
};

export type Truck = {
    id: number;
    plate_number: string;
    driver_name: string;
    driver_phone: string;
    capacity_kg: number;
};

export type PksMill = {
    id: number;
    code: string;
    name: string;
};

export type EkulapUser = {
    id: number;
    name: string;
    username: string | null;
    phone: string | null;
    email: string;
    role: UserRole;
    division_id: number | null;
    status: RecordStatus;
    division?: Division | null;
    created_at: string;
};

export type WeigherOption = {
    id: number;
    name: string;
    username: string | null;
    role: UserRole;
};

export type TphHarvestRecord = {
    id: number;
    lot_number: string;
    work_date: string;
    division_id: number;
    block_id: number;
    tph_point_id: number;
    worker_id: number;
    recorder_user_id: number;
    weigher_user_id: number | null;
    harvest_type: HarvestType;
    sack_count: number;
    tph_count: number;
    bunch_count: number | null;
    gross_weight_kg: number;
    sack_deduction_kg: number;
    net_weight_kg: number;
    photo_path: string | null;
    photo_paths: string[] | null;
    input_latitude: number | null;
    input_longitude: number | null;
    gps_distance_meters: number | null;
    weighed_at: string;
    transport_status: TransportStatus;
    loaded_sack_count: number;
    division?: Division;
    block?: Block;
    tph_point?: TphPoint;
    worker?: Worker;
    workers?: Worker[];
    recorder?: EkulapUser;
    weigher?: EkulapUser | null;
};

export type DeliveryOrderItem = {
    id: number;
    delivery_order_id: number;
    tph_harvest_record_id: number;
    loaded_sacks: number;
    estimated_weight_kg: number;
    loaded_at: string;
    harvest_record?: TphHarvestRecord;
};

export type DeliveryOrder = {
    id: number;
    spb_number: string;
    division_id: number;
    truck_id: number;
    pks_mill_id: number;
    notes: string | null;
    loader_user_id: number;
    total_sacks_loaded: number;
    total_estimated_kg: number;
    loading_photo_paths: string[] | null;
    departed_at: string | null;
    pks_ticket_number: string | null;
    pks_net_weight_kg: number | null;
    weight_shrinkage_kg: number | null;
    pks_slip_photo_path: string | null;
    arrived_at: string | null;
    delivery_status: DeliveryStatus;
    division?: Division;
    truck?: Truck;
    pks_mill?: PksMill;
    loader?: EkulapUser;
    items?: DeliveryOrderItem[];
};

export type AvailableLotOption = {
    id: number;
    lot_number: string;
    work_date?: string;
    division_id?: number;
    division_code?: string;
    block_code?: string;
    tph_code: string;
    worker_name: string;
    harvest_type?: HarvestType;
    sack_count: number;
    loaded_sack_count?: number;
    remaining_sacks: number;
    net_weight_kg: number;
    transport_status?: TransportStatus;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};

export type AiAlert = {
    severity: string;
    title: string;
    detail: string;
};

export type AiSnapshot = {
    provider_configured: boolean;
    active_provider: string | null;
    backlog: {
        pending_lot_count: number;
        total_remaining_sacks: number;
        total_remaining_kg: number;
        lots: Array<{
            lot_number: string;
            work_date: string;
            division: string;
            block: string;
            tph_code: string;
            worker: string;
            harvest_type: string;
            status: string;
            total_sacks: number;
            loaded_sacks: number;
            remaining_sacks: number;
            remaining_kg: number;
        }>;
    };
    shrinkage: {
        spb_count: number;
        total_estimated_kg: number;
        total_pks_kg: number;
        total_shrinkage_kg: number;
        average_shrinkage_percent: number;
        anomaly_count: number;
        records: Array<{
            spb_number: string;
            division: string;
            plate_number: string;
            driver_name: string;
            pks_mill: string;
            pks_ticket_number: string | null;
            estimated_kg: number;
            pks_net_weight_kg: number;
            shrinkage_kg: number;
            shrinkage_percent: number;
            is_anomaly: boolean;
        }>;
    };
    gps_audit: {
        max_tolerance_meters: number;
        flagged_count: number;
        flagged_records: Array<{
            lot_number: string;
            work_date: string;
            division: string;
            tph_code: string;
            recorder: string;
            gps_distance_meters: number;
        }>;
    };
    workers: {
        worker_count: number;
        ranking: Array<{
            worker_code: string;
            name: string;
            job_type: string;
            division: string;
            lot_count: number;
            total_sacks: number;
            total_net_kg: number;
        }>;
    };
    alerts: AiAlert[];
};
