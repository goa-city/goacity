import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const getBaseUrl = () => {
    // In Capacitor native apps, relative URLs point to the local device schema which fails.
    // We must force the absolute remote API server URL for native builds.
    if (Capacitor.isNativePlatform()) {
        return 'https://goa.city/api'; 
    }
    // In dev: Vite proxies /api → production (or local) server via vite.config.js
    // In prod: nginx proxies /api → backend — relative /api works in both cases
    return import.meta.env.VITE_API_URL || '/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        let token = null;

        // 1. Super Admin routes get the dedicated super admin token
        const isSuperAdminRequest = config.url.includes('/superadmin/');
        const isAdminRequest = config.url.includes('/admin/');

        if (isSuperAdminRequest) {
            token = localStorage.getItem('superadmin_token');
        } else if (isAdminRequest) {
            // Admin tokens should only come from localStorage
            token = localStorage.getItem('admin_token');
        } else {
            // Member tokens priority: 
            // 1. localStorage 'token' (persistent)
            // 2. sessionStorage 'token' (session)
            token = localStorage.getItem('token') || sessionStorage.getItem('token');

            // 3. As a LAST resort, if absolutely no member token exists, 
            // check if an admin token exists (only for specific shared routes if any)
            if (!token && !config.url.includes('/auth/')) {
                token = localStorage.getItem('admin_token');
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const citySlug = localStorage.getItem('admin_active_city_slug');
        if (citySlug) {
            config.headers['X-City-Slug'] = citySlug;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
