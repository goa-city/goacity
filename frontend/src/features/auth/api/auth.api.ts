import httpClient from '../../../shared/api/httpClient';
import { AuthResponse, LoginCredentials } from '../types/auth.types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', credentials);
    return data;
};

export const sendOtp = async (identifier: string): Promise<any> => {
    const { data } = await httpClient.post('/auth/send-otp', { identifier });
    return data;
};

export const verifyOtp = async (identifier: string, otp: string, rememberMe: boolean): Promise<AuthResponse> => {
    const { data } = await httpClient.post<AuthResponse>('/auth/verify-otp', { identifier, otp, rememberMe });
    return data;
};

export const getMe = async (): Promise<AuthResponse> => {
    const { data } = await httpClient.get<AuthResponse>('/auth/me');
    return data;
};

export const logout = async (): Promise<void> => {
    await httpClient.post('/auth/logout');
};

export const registerPublicMember = async (formData: FormData): Promise<any> => {
    const { data } = await httpClient.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};
