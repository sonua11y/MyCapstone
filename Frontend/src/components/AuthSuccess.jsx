import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            // Store the token
            localStorage.setItem('token', token);
            // Redirect to dashboard
            navigate('/dashboard');
        } else {
            // If no token, redirect to login
            navigate('/login');
        }
    }, [navigate, location]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>
            <div>Authenticating...</div>
        </div>
    );
};

export default AuthSuccess; 