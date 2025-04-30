const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://capi-safety-backend.onrender.com';

export const config = {
  apiUrl: API_URL,
  auth: {
    login: `${API_URL}/auth/login`,
    google: `${API_URL}/auth/google`,
    googleCallback: `${API_URL}/auth/google/callback`
  }
};

export default config; 