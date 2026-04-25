import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import httpClient from '../shared/api/httpClient';

interface SuperAdmin {
    id: number;
    email: string;
    role: string;
}

interface SuperAdminAuthContextType {
    superAdmin: SuperAdmin | null;
    loading: boolean;
    login: (credentials: { email: string; password?: string }) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined);

export const SuperAdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('superAdminUser');
        if (stored) {
            try {
                setSuperAdmin(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse superadmin session", e);
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials: { email: string; password?: string }) => {
        try {
            const { data } = await httpClient.post('/superadmin/login', credentials);
            const { token, user } = data;
            
            localStorage.setItem('superAdminToken', token);
            localStorage.setItem('superAdminUser', JSON.stringify(user));
            
            setSuperAdmin(user);
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'SuperAdmin login failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminUser');
        setSuperAdmin(null);
    };

    return (
        <SuperAdminAuthContext.Provider value={{ superAdmin, loading, login, logout }}>
            {children}
        </SuperAdminAuthContext.Provider>
    );
};

export const useSuperAdminAuth = () => {
    const context = useContext(SuperAdminAuthContext);
    if (context === undefined) {
        throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider');
    }
    return context;
};
