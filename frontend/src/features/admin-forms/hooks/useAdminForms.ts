import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminForms, fetchAdminFormDetail, saveFormStructure, createForm } from '../api/admin-forms.api';

export const useAdminForms = (formId?: number) => {
    const queryClient = useQueryClient();

    const formsQuery = useQuery({
        queryKey: ['admin-forms'],
        queryFn: fetchAdminForms,
        enabled: !formId
    });

    const formDetailQuery = useQuery({
        queryKey: ['admin-form-detail', formId],
        queryFn: () => fetchAdminFormDetail(formId!),
        enabled: !!formId
    });

    const saveMutation = useMutation({
        mutationFn: (data: any) => saveFormStructure(formId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
            queryClient.invalidateQueries({ queryKey: ['admin-form-detail', formId] });
        }
    });

    const createMutation = useMutation({
        mutationFn: createForm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
        }
    });

    return {
        forms: formsQuery.data || [],
        form: formDetailQuery.data,
        isLoading: formsQuery.isLoading || formDetailQuery.isLoading,
        saveForm: saveMutation.mutateAsync,
        isSaving: saveMutation.isPending,
        createForm: createMutation.mutateAsync,
        isCreating: createMutation.isPending
    };
};
