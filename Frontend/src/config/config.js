const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://mycapstone-1-h9gg.onrender.com';

// Log the API URL being used (helpful for debugging)
console.log('API URL being used:', API_URL);

export const config = {
  apiUrl: API_URL,
  auth: {
    login: `${API_URL}/auth/login`,
    google: `${API_URL}/auth/google`,
    googleCallback: `${API_URL}/auth/google/callback`
  }
};

export default config; 