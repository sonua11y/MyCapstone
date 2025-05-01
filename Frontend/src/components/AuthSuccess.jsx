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
                    email: decoded.email, // Store email in both formats
                    name: decoded.name,
                    lastLogin: new Date().toLocaleString(),
                    Admins: decoded.admin // Store admin status if available
                };
                localStorage.setItem('userData', JSON.stringify(userData));
                console.log('Stored user data:', userData); // For debugging
            } catch (error) {
                console.error('Error decoding token:', error);
                // Store minimal user data if token decode fails
                const fallbackData = {
                    "Email id": "user@example.com",
                    email: "user@example.com",
                    name: "User",
                    lastLogin: new Date().toLocaleString()
                };
                localStorage.setItem('userData', JSON.stringify(fallbackData));
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
            height: '100vh',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div className="loading-spinner"></div>
            <div>Authenticating...</div>
        </div>
    );
};

export default AuthSuccess; 