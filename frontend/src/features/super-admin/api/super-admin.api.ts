import httpClient from '../../../shared/api/httpClient';

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
    const { data } = await httpClient.get<City[]>('/admin/cities');
    return data;
};

export const updateCityBranding = async (id: number, branding: any): Promise<void> => {
    await httpClient.put(`/admin/cities`, { id, theme_config: branding });
};

export const createCity = async (cityData: Partial<City>): Promise<City> => {
    const { data } = await httpClient.post<City>('/admin/cities', cityData);
    return data;
};
