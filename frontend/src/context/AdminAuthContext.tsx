import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import httpClient from '../shared/api/httpClient';

interface AdminUser {
    id: number;
    full_name: string;
    email: string;
    role: string;
}

interface City {
    id: number;
    name: string;
    slug: string;
}

interface AdminAuthContextType {
    adminUser: AdminUser | null;
    loading: boolean;
    login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    activeCity: City | null;
    citiesList: City[];
    changeCity: (city: City) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeCity, setActiveCity] = useState<City | null>(null);
    const [citiesList, setCitiesList] = useState<City[]>([]);

    useEffect(() => {
        const storedAdmin = localStorage.getItem('adminUser');
        const storedCity = localStorage.getItem('admin_active_city');
        
        if (storedAdmin) {
            try {
                setAdminUser(JSON.parse(storedAdmin));
            } catch (e) {
                console.error("Failed to parse admin session", e);
            }
        }
        
        if (storedCity) {
            try {
                setActiveCity(JSON.parse(storedCity));
            } catch (e) {
                console.error("Failed to parse stored city", e);
            }
        } else {
            // Default city
            setActiveCity({ id: 1, name: 'Goa', slug: 'goa' });
        }
        
        setLoading(false);
    }, []);

    const login = async (email: string, password?: string) => {
        try {
            const { data } = await httpClient.post('/admin/login', { email, password });
            const { token, user } = data;
            
            localStorage.setItem('admin_token', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            
            setAdminUser(user);
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Admin login failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('admin_active_city');
        setAdminUser(null);
    };

    const changeCity = (city: City) => {
        setActiveCity(city);
        localStorage.setItem('admin_active_city', JSON.stringify(city));
        localStorage.setItem('admin_active_city_slug', city.slug);
    };

    return (
        <AdminAuthContext.Provider value={{ adminUser, loading, login, logout, activeCity, citiesList, changeCity }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
