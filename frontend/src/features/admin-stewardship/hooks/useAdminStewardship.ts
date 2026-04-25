import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPendingLogs, verifyStewardshipLog, rejectStewardshipLog } from '../api/admin-stewardship.api';

export const useAdminStewardship = () => {
    const queryClient = useQueryClient();

    const logsQuery = useQuery({
        queryKey: ['admin-stewardship-pending'],
        queryFn: fetchPendingLogs
    });

    const verifyMutation = useMutation({
        mutationFn: verifyStewardshipLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-stewardship-pending'] });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number, reason: string }) => rejectStewardshipLog(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-stewardship-pending'] });
        }
    });

    return {
        pendingLogs: logsQuery.data || [],
        isLoading: logsQuery.isLoading,
        verify: verifyMutation.mutateAsync,
        isVerifying: verifyMutation.isPending,
        reject: rejectMutation.mutateAsync,
        isRejecting: rejectMutation.isPending
    };
};
