import httpClient from '../../../shared/api/httpClient';

export interface DashboardStats {
    members: number;
    streams: number;
    meetings: number;
    forms: number;
    businesses?: number;
}

export const fetchAdminStats = async (): Promise<DashboardStats> => {
    const { data } = await httpClient.get<DashboardStats>('/admin/stats');
    return data;
};
