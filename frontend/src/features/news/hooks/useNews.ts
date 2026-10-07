import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNewsFeed, createPost, likePost, deletePost, updatePost } from '../api/news.api';

export const useNews = (page = 1) => {
    const queryClient = useQueryClient();

    const feedQuery = useQuery({
        queryKey: ['news-feed', page],
        queryFn: () => fetchNewsFeed(page),
        staleTime: 60 * 1000, // 1 minute
    });

    const createPostMutation = useMutation({
        mutationFn: ({ postData, onProgress }: { postData: any; onProgress?: (progressEvent: any) => void }) =>
            createPost(postData, onProgress),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news-feed'] });
        }
    });

    const createPostWrapper = (postData: any, onProgress?: (progressEvent: any) => void) => {
        return createPostMutation.mutateAsync({ postData, onProgress });
    };

    const likeMutation = useMutation({
        mutationFn: likePost,
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

    const updateMutation = useMutation({
        mutationFn: updatePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news-feed'] });
        }
    });

    return {
        feed: (feedQuery.data as any[]) || [],
        isLoading: feedQuery.isLoading,
        isError: feedQuery.isError,
        createPost: createPostWrapper,
        isCreating: createPostMutation.isPending,
        likePost: likeMutation.mutateAsync,
        deletePost: deleteMutation.mutateAsync,
        updatePost: updateMutation.mutateAsync
    };
};
