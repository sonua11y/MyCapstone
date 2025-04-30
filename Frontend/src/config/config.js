const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://mycapstone-1-h9gg.onrender.com';

// Debug information
console.log('Environment Variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  'Using URL': API_URL
});

export const config = {
  apiUrl: API_URL,
  auth: {
    login: `${API_URL}/auth/login`,
    google: `${API_URL}/auth/google`,
    googleCallback: `${API_URL}/auth/google/callback`
  }
};

// Log all endpoints
console.log('API Endpoints:', {
  login: config.auth.login,
  google: config.auth.google,
  googleCallback: config.auth.googleCallback
});

export default config; 