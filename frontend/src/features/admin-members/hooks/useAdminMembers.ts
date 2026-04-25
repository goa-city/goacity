import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminMembers, fetchAdminMemberDetail, updateAdminMember, deleteAdminMember } from '../api/admin-members.api';

export const useAdminMembers = (memberId?: number) => {
    const queryClient = useQueryClient();

    const membersQuery = useQuery({
        queryKey: ['admin-members'],
        queryFn: fetchAdminMembers,
        enabled: !memberId
    });

    const memberDetailQuery = useQuery({
        queryKey: ['admin-member-detail', memberId],
        queryFn: () => fetchAdminMemberDetail(memberId!),
        enabled: !!memberId
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateAdminMember(memberId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-members'] });
            queryClient.invalidateQueries({ queryKey: ['admin-member-detail', memberId] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAdminMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-members'] });
        }
    });

    return {
        members: membersQuery.data || [],
        member: memberDetailQuery.data,
        isLoading: membersQuery.isLoading || memberDetailQuery.isLoading,
        updateMember: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteMember: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    };
};
