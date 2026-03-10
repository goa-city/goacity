import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [citiesList, setCitiesList] = useState([]);
    const [activeCity, setActiveCity] = useState(null);

    const fetchCities = async () => {
        try {
            const res = await api.get('/admin/cities');
            setCitiesList(res.data);
            
            // Set initial active city from localStorage or default to first
            const savedCityId = localStorage.getItem('admin_active_city_id');
            const found = res.data.find(c => String(c.id) === String(savedCityId));
            const initial = found || res.data[0];
            
            if (initial) {
                setActiveCity(initial);
                localStorage.setItem('admin_active_city_id', initial.id);
                localStorage.setItem('admin_active_city_slug', initial.slug);
            }
        } catch (err) {
            console.error("Failed to fetch cities", err);
        }
    };

    useEffect(() => {
        const checkAdmin = async () => {
            const token = localStorage.getItem('admin_token');
            const storedUser = localStorage.getItem('admin_user');

            if (token && storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    setAdminUser(user);
                    // Fetch cities for admin
                    fetchCities();
                } catch (e) {
                    console.error("Failed to parse admin data", e);
                    logout();
                }
            }
            setLoading(false);
        };
        checkAdmin();
    }, []);

    const changeCity = (city) => {
        setActiveCity(city);
        localStorage.setItem('admin_active_city_id', city.id);
        localStorage.setItem('admin_active_city_slug', city.slug);
        // Optional: Refresh data or navigate to dashboard
        window.location.reload(); 
    };

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
            await fetchCities();
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
        localStorage.removeItem('admin_active_city_id');
        setAdminUser(null);
        setCitiesList([]);
        setActiveCity(null);
    };

    return (
        <AdminAuthContext.Provider value={{ 
            adminUser, 
            loading, 
            login, 
            logout,
            citiesList,
            activeCity,
            changeCity
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
