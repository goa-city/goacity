import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats } from '../api/admin-dashboard.api';

export const useAdminDashboard = () => {
    const statsQuery = useQuery({
        queryKey: ['admin-stats'],
        queryFn: fetchAdminStats
    });

    return {
        stats: statsQuery.data || { members: 0, streams: 0, meetings: 0, forms: 0 },
        isLoading: statsQuery.isLoading,
        isError: statsQuery.isError
    };
};
