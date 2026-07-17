import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/mentorship.api';

interface UseMentorshipOptions {
    id?: string;
    search?: string;
    area?: string;
}

export const useMentorship = (options?: string | UseMentorshipOptions) => {
    const queryClient = useQueryClient();
    const config = typeof options === 'string' ? { id: options } : (options || {});
    const { id, search = '', area = '' } = config;

    // Queries
    const mentorsQuery = useQuery({
        queryKey: ['mentors', search, area],
        queryFn: () => api.fetchMentors(search, area)
    });

    const myMentorshipsQuery = useQuery({
        queryKey: ['my-mentorships'],
        queryFn: api.fetchMyMentorships
    });

    const mentorshipDetailQuery = useQuery({
        queryKey: ['mentorship', id],
        queryFn: () => id ? api.fetchMentorshipById(id) : null,
        enabled: !!id
    });

    const mentorProfileQuery = useQuery({
        queryKey: ['mentor-profile'],
        queryFn: api.fetchMentorProfile
    });

    // Mutations
    const requestMutation = useMutation({
        mutationFn: api.requestMentorship,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-mentorships'] })
    });

    const updateProfileMutation = useMutation({
        mutationFn: api.updateMentorProfile,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentor-profile'] })
    });

    const addGoalMutation = useMutation({
        mutationFn: (data: any) => api.addMentorshipGoal(id!, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const updateGoalMutation = useMutation({
        mutationFn: ({ goalId, data }: { goalId: string; data: any }) => api.updateMentorshipGoal(goalId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const logSessionMutation = useMutation({
        mutationFn: (data: any) => api.logMentorshipSession(id!, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const updateSessionMutation = useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: string; data: any }) => api.updateMentorshipSession(sessionId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const submitSessionPaymentMutation = useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: string; data: any }) => api.submitSessionPayment(sessionId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const verifySessionPaymentMutation = useMutation({
        mutationFn: (sessionId: string) => api.verifySessionPayment(sessionId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const addMaterialMutation = useMutation({
        mutationFn: (formData: FormData) => api.addMentorshipMaterial(id!, formData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const submitMaterialResponseMutation = useMutation({
        mutationFn: ({ materialId, formData }: { materialId: string; formData: FormData }) => api.submitMaterialResponse(materialId, formData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const deleteMaterialMutation = useMutation({
        mutationFn: (materialId: string) => api.deleteMentorshipMaterial(materialId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const addTaskMutation = useMutation({
        mutationFn: (data: any) => api.addMentorshipTask(id!, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: any }) => api.updateMentorshipTask(taskId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const updatePhaseMutation = useMutation({
        mutationFn: (phase: string) => api.updateMentorshipPhase(id!, phase),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => api.updateMentorshipStatus(id!, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentorship', id] });
            queryClient.invalidateQueries({ queryKey: ['my-mentorships'] });
        }
    });

    const deleteSessionMutation = useMutation({
        mutationFn: (sessionId: string) => api.deleteMentorshipSession(sessionId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    const deleteGoalMutation = useMutation({
        mutationFn: (goalId: string) => api.deleteMentorshipGoal(goalId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship', id] })
    });

    return {
        mentors: mentorsQuery.data || [],
        myMentorships: myMentorshipsQuery.data || [],
        mentorship: mentorshipDetailQuery.data,
        mentorProfile: mentorProfileQuery.data,
        isLoading: mentorsQuery.isLoading || myMentorshipsQuery.isLoading || mentorshipDetailQuery.isLoading,
        
        requestMentorship: requestMutation.mutateAsync,
        updateProfile: updateProfileMutation.mutateAsync,
        addGoal: addGoalMutation.mutateAsync,
        updateGoal: updateGoalMutation.mutateAsync,
        deleteGoal: deleteGoalMutation.mutateAsync,
        logSession: logSessionMutation.mutateAsync,
        updateSession: updateSessionMutation.mutateAsync,
        deleteSession: deleteSessionMutation.mutateAsync,
        submitSessionPayment: submitSessionPaymentMutation.mutateAsync,
        verifySessionPayment: verifySessionPaymentMutation.mutateAsync,
        addMaterial: addMaterialMutation.mutateAsync,
        submitMaterialResponse: submitMaterialResponseMutation.mutateAsync,
        deleteMaterial: deleteMaterialMutation.mutateAsync,
        addTask: addTaskMutation.mutateAsync,
        updateTask: updateTaskMutation.mutateAsync,
        updatePhase: updatePhaseMutation.mutateAsync,
        updateStatus: updateStatusMutation.mutateAsync,

        isMutating: requestMutation.isPending || updateProfileMutation.isPending || 
                    addGoalMutation.isPending || logSessionMutation.isPending || 
                    updateStatusMutation.isPending || updateSessionMutation.isPending ||
                    submitSessionPaymentMutation.isPending || verifySessionPaymentMutation.isPending ||
                    addMaterialMutation.isPending || submitMaterialResponseMutation.isPending
    };
};
