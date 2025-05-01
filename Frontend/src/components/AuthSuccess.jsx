import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            // Store the token
            localStorage.setItem('token', token);
            
            // Decode the token and store user data
            try {
                const decoded = jwtDecode(token);
                const userData = {
                    "Email id": decoded.email,
                    name: decoded.name,
                    lastLogin: new Date().toLocaleString()
                };
                localStorage.setItem('userData', JSON.stringify(userData));
            } catch (error) {
                console.error('Error decoding token:', error);
            }

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