import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNewsFeed, createPost, likePost, deletePost } from '../api/news.api';

export const useNews = (page = 1) => {
    const queryClient = useQueryClient();

    const feedQuery = useQuery({
        queryKey: ['news-feed', page],
        queryFn: () => fetchNewsFeed(page),
        staleTime: 60 * 1000, // 1 minute
    });

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news-feed'] });
        }
    });

    const likeMutation = useMutation({
        mutationFn: likePost,
        onMutate: async (postId) => {
            // Optional: Optimistic update could go here
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news-feed'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news-feed'] });
        }
    });

    return {
        feed: feedQuery.data || [],
        isLoading: feedQuery.isLoading,
        isError: feedQuery.isError,
        createPost: createPostMutation.mutateAsync,
        isCreating: createPostMutation.isPending,
        likePost: likeMutation.mutateAsync,
        deletePost: deleteMutation.mutateAsync
    };
};
