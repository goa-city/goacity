import api from '../../../api/axios';

export interface City {
    id: number;
    name: string;
    slug: string;
    domain?: string;
    timezone?: string;
    theme_config?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
}

export const fetchCities = async (): Promise<City[]> => {
    const { data } = await api.get<City[]>('/superadmin/cities');
    return data;
};

export const updateCityBranding = async (id: number, branding: any): Promise<void> => {
    await api.put(`/superadmin/cities`, { id, theme_config: branding });
};

export const createCity = async (cityData: Partial<City>): Promise<City> => {
    const { data } = await api.post<City>('/superadmin/cities', cityData);
    return data;
};
