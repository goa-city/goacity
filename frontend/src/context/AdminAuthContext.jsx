import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const token = localStorage.getItem('admin_token');
            const storedUser = localStorage.getItem('admin_user');

            if (token && storedUser) {
                try {
                    setAdminUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse admin data", e);
                    logout();
                }
            }
            setLoading(false);
        };
        checkAdmin();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/admin-login', {
                email,
                password
            });
            
            const { token, user } = response.data;
            
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));
            
            setAdminUser(user);
            return { success: true };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: error.response?.data?.message || 'Admin login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setAdminUser(null);
    };

    return (
        <AdminAuthContext.Provider value={{ 
            adminUser, 
            loading, 
            login, 
            logout 
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
