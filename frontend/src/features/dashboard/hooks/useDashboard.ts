import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData, fetchRecentCollabs } from '../api/dashboard.api';

export const useDashboard = () => {
    const dashboardQuery = useQuery({
        queryKey: ['member-dashboard'],
        queryFn: fetchDashboardData,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    const collabsQuery = useQuery({
        queryKey: ['dashboard-collabs'],
        queryFn: fetchRecentCollabs,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        data: (dashboardQuery.data as any) || { streams: [], pending_actions: [] },
        collabs: (collabsQuery.data as any) || [],
        isLoading: dashboardQuery.isLoading || collabsQuery.isLoading,
        error: dashboardQuery.error || collabsQuery.error,
        refetch: async () => {
            await Promise.all([dashboardQuery.refetch(), collabsQuery.refetch()]);
        }
    };
};
