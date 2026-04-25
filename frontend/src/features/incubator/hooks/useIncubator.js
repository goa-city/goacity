import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchActiveIdeas, submitIdea, submitIdeaFeedback } from '../api/incubator.api';

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
        mutationFn: ({ ideaId, feedback }) => submitIdeaFeedback(ideaId, feedback),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incubator-ideas'] });
        }
    });

    return {
        ideas: ideasQuery.data || [],
        isLoading: ideasQuery.isLoading,
        error: ideasQuery.error,
        submitIdea: submitIdeaMutation.mutateAsync,
        isSubmitting: submitIdeaMutation.isPending,
        submitFeedback: submitFeedbackMutation.mutateAsync,
        isSubmittingFeedback: submitFeedbackMutation.isPending
    };
};
