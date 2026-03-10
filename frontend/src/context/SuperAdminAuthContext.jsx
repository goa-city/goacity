import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const SuperAdminAuthContext = createContext();

export const SuperAdminAuthProvider = ({ children }) => {
    const [superAdminUser, setSuperAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('superadmin_token');
        const storedUser = localStorage.getItem('superadmin_user');

        if (token && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                // Only grant access if the user actually has the super admin flag
                if (user.isSuperAdmin) {
                    setSuperAdminUser(user);
                } else {
                    // Remove invalid session silently
                    localStorage.removeItem('superadmin_token');
                    localStorage.removeItem('superadmin_user');
                }
            } catch (e) {
                localStorage.removeItem('superadmin_token');
                localStorage.removeItem('superadmin_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/admin-login', { email, password });
            const { token, user } = response.data;

            if (!user.isSuperAdmin) {
                return { success: false, message: 'You do not have Super Admin privileges.' };
            }

            localStorage.setItem('superadmin_token', token);
            localStorage.setItem('superadmin_user', JSON.stringify(user));
            setSuperAdminUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('superadmin_token');
        localStorage.removeItem('superadmin_user');
        setSuperAdminUser(null);
    };

    return (
        <SuperAdminAuthContext.Provider value={{ superAdminUser, loading, login, logout }}>
            {children}
        </SuperAdminAuthContext.Provider>
    );
};

export const useSuperAdminAuth = () => useContext(SuperAdminAuthContext);
