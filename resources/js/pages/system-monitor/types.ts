export type SystemOverview = {
    status: 'aman' | 'perhatian' | 'gangguan';
    status_label: string;
    headline: string;
    narrative: string;
    errors_24h: number;
    upload_failures_24h: number;
    failed_logins_24h: number;
    sensitive_actions_24h: number;
    storage_link_active: boolean;
    log_file_size_kb: number;
};

export type TranslatedIncident = {
    id: string;
    occurred_at: string;
    occurred_human: string;
    is_recent_24h: boolean;
    severity: string;
    severity_label: string;
    category: string;
    title: string;
    human_summary: string;
    recommended_action: string;
    technical_detail: string;
};

export type AuditLogRecord = {
    id: number;
    user_id: number | null;
    actor_name: string;
    actor_username: string | null;
    actor_role: string | null;
    category: string;
    action: string;
    severity: string;
    human_message: string;
    subject_type: string | null;
    subject_id: number | null;
    ip_address: string | null;
    created_at: string;
};

export type MonitorFilters = {
    tab: string;
    category: string;
    severity: string;
    search: string;
    date_from: string;
    date_to: string;
};

export type CategoryOption = {
    value: string;
    label: string;
};
