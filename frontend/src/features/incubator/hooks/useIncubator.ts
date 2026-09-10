import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchActiveIdeas, submitIdea, submitIdeaFeedback, fetchIdeaById } from '../api/incubator.api';

export const useIncubatorIdea = (id: string) => {
    return useQuery({
        queryKey: ['incubator-idea', id],
        queryFn: () => fetchIdeaById(id),
        enabled: !!id
    });
};

export const useIncubator = () => {
    const queryClient = useQueryClient();

    const ideasQuery = useQuery({
        queryKey: ['incubator-ideas'],
        queryFn: fetchActiveIdeas
    });

    const submitIdeaMutation = useMutation({
        mutationFn: submitIdea,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incubator-ideas'] });
        }
    });

    const submitFeedbackMutation = useMutation({
        mutationFn: ({ ideaId, feedback }: { ideaId: string; feedback: any }) => submitIdeaFeedback(ideaId, feedback),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incubator-ideas'] });
        }
    });

    return {
        ideas: (ideasQuery.data as any[]) || [],
        isLoading: ideasQuery.isLoading,
        error: ideasQuery.error,
        submitIdea: submitIdeaMutation.mutateAsync,
        isSubmitting: submitIdeaMutation.isPending,
        submitFeedback: submitFeedbackMutation.mutateAsync,
        isSubmittingFeedback: submitFeedbackMutation.isPending
    };
};
