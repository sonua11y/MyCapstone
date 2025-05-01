const environments = {
    development: {
        apiUrl: 'http://localhost:5000',
        env: 'development'
    },
    production: {
        apiUrl: 'https://mycapstone-3.onrender.com',
        env: 'production'
    }
};

const getCurrentEnvironment = () => {
    // Check for environment-specific URL patterns
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return environments.development;
    }
    return environments.production; // Default to production for all other cases
};

const currentEnv = getCurrentEnvironment();

export const config = {
    apiUrl: currentEnv.apiUrl,
    env: currentEnv.env,
    auth: {
        login: `${currentEnv.apiUrl}/auth/login`,
        google: `${currentEnv.apiUrl}/auth/google`,
        googleCallback: `${currentEnv.apiUrl}/auth/google/callback`
    },
    isProduction: currentEnv.env === 'production',
    isDevelopment: currentEnv.env === 'development'
};

// Add visual indicator for development environment
if (config.isDevelopment) {
    const style = document.createElement('style');
    style.textContent = `
        body::before {
            content: 'DEVELOPMENT';
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            background: #4caf50;
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: bold;
            z-index: 9999;
            border-radius: 0 0 4px 4px;
        }
    `;
    document.head.appendChild(style);
}

export default config; 