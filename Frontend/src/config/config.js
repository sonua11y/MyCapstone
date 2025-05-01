const environments = {
    development: {
        apiUrl: 'http://localhost:5000',
        env: 'development'
    },
    uat: {
        apiUrl: 'https://uat-api.capisafety.com',
        env: 'uat'
    },
    production: {
        apiUrl: 'https://api.capisafety.com',
        env: 'production'
    }
};

const getCurrentEnvironment = () => {
    // Check for environment-specific URL patterns
    const hostname = window.location.hostname;
    if (hostname.includes('uat')) {
        return environments.uat;
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return environments.development;
    } else if (hostname.includes('capisafety.com')) {
        return environments.production;
    }
    return environments.development; // Default to development
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
    isUAT: currentEnv.env === 'uat',
    isDevelopment: currentEnv.env === 'development'
};

// Add visual indicator for non-production environments
if (!config.isProduction) {
    const style = document.createElement('style');
    const color = config.isUAT ? '#ff9800' : '#4caf50';
    style.textContent = `
        body::before {
            content: '${config.env.toUpperCase()} ENVIRONMENT';
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
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