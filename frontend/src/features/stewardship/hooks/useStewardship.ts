import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStewardshipSummary, fetchStewardshipLogs, createStewardshipLog } from '../api/stewardship.api';

export const useStewardship = () => {
    const queryClient = useQueryClient();

    const summaryQuery = useQuery({
        queryKey: ['stewardship-summary'],
        queryFn: fetchStewardshipSummary
    });

    const logsQuery = useQuery({
        queryKey: ['stewardship-logs'],
        queryFn: fetchStewardshipLogs
    });

    const createLogMutation = useMutation({
        mutationFn: createStewardshipLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stewardship-summary'] });
            queryClient.invalidateQueries({ queryKey: ['stewardship-logs'] });
        }
    });

    return {
        summary: (summaryQuery.data as any) || { totalFinancial: 0, totalHours: 0, verifiedCount: 0 },
        logs: (logsQuery.data as any[]) || [],
        isLoading: summaryQuery.isLoading || logsQuery.isLoading,
        createLog: createLogMutation.mutateAsync,
        isCreating: createLogMutation.isPending
    };
};
