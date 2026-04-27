import httpClient from '../../../shared/api/httpClient';

export const fetchDashboardData = async () => {
    const { data } = await httpClient.get('/member/dashboard');
    return data;
};

export const fetchRecentCollabs = async () => {
    const { data } = await httpClient.get('/member/dashboard/collabs');
    return data.data || [];
};
