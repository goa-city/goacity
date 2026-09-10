import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types/auth.types';
import * as authApi from '../api/auth.api';
import { ThemeHandler } from '../../../shared/components/ThemeHandler';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
    sendOtp: (identifier: string) => Promise<{ success: boolean; message?: string }>;
    verifyOtp: (identifier: string, otp: string, rememberMe: boolean) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    loginWithToken: (token: string) => Promise<{ success: boolean; user?: User; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const authToken = urlParams.get('auth_token');

        if (authToken) {
            try {
                const { user: tokenUser } = await authApi.tokenLogin(authToken);
                if (tokenUser) {
                    const userString = JSON.stringify(tokenUser);
                    localStorage.setItem('token', authToken);
                    localStorage.setItem('user', userString);
                    sessionStorage.setItem('token', authToken);
                    sessionStorage.setItem('user', userString);
                    setUser(tokenUser);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error("Token login failed during checkAuth:", err);
            }
        }

        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user session", e);
                logout();
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const loginWithToken = async (token: string) => {
        try {
            const { user } = await authApi.tokenLogin(token);
            const userString = JSON.stringify(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', userString);
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', userString);
            setUser(user);
            return { success: true, user };
        } catch (error: any) {
            console.error('Auto-login with token failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Token login failed'
            };
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const { token, user } = await authApi.login(credentials);
            const userString = JSON.stringify(user);
            
            // Default to session storage unless "remember me" is added later
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', userString);
            
            setUser(user);
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const sendOtp = async (identifier: string) => {
        try {
            await authApi.sendOtp(identifier);
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Failed to send OTP' 
            };
        }
    };

    const verifyOtp = async (identifier: string, otp: string, rememberMe: boolean) => {
        try {
            const { token, user } = await authApi.verifyOtp(identifier, otp, rememberMe);
            const userString = JSON.stringify(user);
            
            if (rememberMe) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', userString);
            } else {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', userString);
            }
            
            setUser(user);
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Invalid OTP' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, sendOtp, verifyOtp, logout, checkAuth, loginWithToken }}>
            <ThemeHandler config={user?.city?.theme_config} />
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
