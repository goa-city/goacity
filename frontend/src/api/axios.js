import axios from 'axios';

const api = axios.create({
    // In dev: Vite proxies /api → production (or local) server via vite.config.js
    // In prod: nginx proxies /api → backend — relative /api works in both cases
    baseURL: import.meta.env.VITE_API_URL || '/api',
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
            // 3. Cookies 'token' (Remember me)
            token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            if (!token) {
                const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
                if (match) token = match[1];
            }

            // 4. As a LAST resort, if absolutely no member token exists, 
            // check if an admin token exists (only for specific shared routes if any)
            // But generally, we don't want admin_token to override member session
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
