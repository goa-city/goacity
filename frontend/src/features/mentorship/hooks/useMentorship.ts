import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMentors, requestMentorship, fetchMyMentorships, updateMentorshipGoals } from '../api/mentorship.api';

export const useMentorship = (filters: { search?: string; area?: string } = {}) => {
    const queryClient = useQueryClient();

    const mentorsQuery = useQuery({
        queryKey: ['mentors', filters],
        queryFn: () => fetchMentors(filters.search, filters.area)
    });

    const myMentorshipsQuery = useQuery({
        queryKey: ['my-mentorships'],
        queryFn: fetchMyMentorships
    });

    const requestMutation = useMutation({
        mutationFn: requestMentorship,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-mentorships'] });
        }
    });

    const updateGoalsMutation = useMutation({
        mutationFn: ({ id, goals }: { id: number; goals: any }) => updateMentorshipGoals(id, goals),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-mentorships'] });
        }
    });

    return {
        mentors: (mentorsQuery.data as any[]) || [],
        myMentorships: (myMentorshipsQuery.data as any) || [],
        isLoading: mentorsQuery.isLoading || myMentorshipsQuery.isLoading,
        requestMentorship: requestMutation.mutateAsync,
        isRequesting: requestMutation.isPending,
        updateGoals: updateGoalsMutation.mutateAsync,
        isUpdatingGoals: updateGoalsMutation.isPending
    };
};
