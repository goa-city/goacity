import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';

// Assets
import goa1 from '../assets/goa1.webp';
import goa2 from '../assets/goa2.webp';
import goa3 from '../assets/goa3.webp';
import goa4 from '../assets/goa4.webp';

const images = [goa1, goa2, goa3, goa4];

const Login: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Pick a random image once when the component is first created
    const backgroundImage = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return <LoginForm backgroundImage={backgroundImage} />;
};

export default Login;
