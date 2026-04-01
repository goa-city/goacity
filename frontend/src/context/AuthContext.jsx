import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            // Check localStorage first (persistent "Remember Me" login)
            let token = localStorage.getItem('token');
            let storedUser = localStorage.getItem('user');

            // Fallback to sessionStorage (non-persistent session login)
            if (!token || !storedUser) {
                token = sessionStorage.getItem('token');
                storedUser = sessionStorage.getItem('user');
            }

            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user data", e);
                    logout();
                }
            }

            setLoading(false);
        };
        checkUser();
    }, []);

    // --- Member Actions ---

    const sendOtp = async (emailOrPhone) => {
        try {
            const isEmail = emailOrPhone.includes('@');
            await api.post('/auth/send-otp', {
                identifier: emailOrPhone
            });
            return { success: true };
        } catch (error) {
            console.error(error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to send OTP' 
            };
        }
    };

    const verifyOtp = async (emailOrPhone, otp, rememberMe = false) => {
        try {
            const isEmail = emailOrPhone.includes('@');
            const response = await api.post('/auth/verify-otp', {
                identifier: emailOrPhone,
                otp,
                rememberMe
            });
            
            const { token, user } = response.data;
            const userString = JSON.stringify(user);

            if (rememberMe) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', userString);
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
            } else {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', userString);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error(error);
             return { 
                success: false, 
                message: error.response?.data?.message || 'Invalid OTP' 
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
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            sendOtp, 
            verifyOtp, 
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
