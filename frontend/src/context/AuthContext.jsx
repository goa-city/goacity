import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Helper functions for cookies
const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict"; // Added SameSite for security
};

const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

const removeCookie = (name) => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            // Check Member cookies first (persistent "Remember Me" login)
            let token = getCookie('token');
            let storedUser = getCookie('user');

            // Fallback to localStorage
            if (!token || !storedUser) {
                token = localStorage.getItem('token');
                storedUser = localStorage.getItem('user');
            }

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
                setCookie('token', token, 180);
                setCookie('user', userString, 180);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', userString);
                removeCookie('token');
                removeCookie('user');
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
        removeCookie('token');
        removeCookie('user');
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
