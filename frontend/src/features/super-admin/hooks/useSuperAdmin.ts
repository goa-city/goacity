import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCities, updateCityBranding, createCity } from '../api/super-admin.api';

export const useSuperAdmin = () => {
    const queryClient = useQueryClient();

    const citiesQuery = useQuery({
        queryKey: ['super-admin-cities'],
        queryFn: fetchCities
    });

    const updateBrandingMutation = useMutation({
        mutationFn: ({ id, branding }: { id: number, branding: any }) => updateCityBranding(id, branding),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-admin-cities'] });
        }
    });

    const createCityMutation = useMutation({
        mutationFn: createCity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-admin-cities'] });
        }
    });

    return {
        cities: citiesQuery.data || [],
        isLoading: citiesQuery.isLoading,
        updateBranding: updateBrandingMutation.mutateAsync,
        isUpdating: updateBrandingMutation.isPending,
        createNewCity: createCityMutation.mutateAsync,
        isCreating: createCityMutation.isPending
    };
};
