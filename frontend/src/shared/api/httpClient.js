import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const getBaseUrl = () => {
    if (Capacitor.isNativePlatform()) {
        return 'https://goa.city/api'; 
    }
    return import.meta.env.VITE_API_URL || '/api';
};

const httpClient = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15000,
});

// Request Interceptor: Attach Tokens & City Context
httpClient.interceptors.request.use(
    (config) => {
        let token = null;

        const isSuperAdminRequest = config.url.includes('/superadmin/');
        const isAdminRequest = config.url.includes('/admin/');

        if (isSuperAdminRequest) {
            token = localStorage.getItem('superadmin_token');
        } else if (isAdminRequest) {
            token = localStorage.getItem('admin_token');
        } else {
            token = localStorage.getItem('token') || sessionStorage.getItem('token');
            // Fallback for admin accessing member routes if no member token
            if (!token && !config.url.includes('/auth/')) {
                token = localStorage.getItem('admin_token');
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // City Context (X-City-Slug)
        const citySlug = localStorage.getItem('admin_active_city_slug');
        if (citySlug) {
            config.headers['X-City-Slug'] = citySlug;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            console.error('[API] Unauthorized. Logging out...');
            // Optional: Clear tokens and redirect to login
            // localStorage.removeItem('token');
            // localStorage.removeItem('admin_token');
            // window.location.href = '/';
        } else if (status === 403) {
            console.error('[API] Forbidden. You do not have permission.');
        } else if (status === 500) {
            console.error('[API] Internal Server Error. Please try again later.');
        }

        return Promise.reject(error);
    }
);

export default httpClient;
