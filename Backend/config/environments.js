require('dotenv').config();

const environments = {
    development: {
        mongodb_uri: 'mongodb+srv://sripranathiindupalli:studentfeetracker@capi.eqhj3yr.mongodb.net/StudentData?retryWrites=true&w=majority&appName=Capi',
        frontend_url: 'http://localhost:3000',
        backend_url: 'http://localhost:5000',
        env_name: 'development'
    },
    uat: {
        mongodb_uri: process.env.UAT_MONGODB_URI || 'mongodb+srv://sripranathiindupalli:studentfeetracker@capi.eqhj3yr.mongodb.net/StudentData_UAT?retryWrites=true&w=majority&appName=Capi',
        frontend_url: process.env.UAT_FRONTEND_URL || 'https://uat.capisafety.com',
        backend_url: process.env.UAT_BACKEND_URL || 'https://uat-api.capisafety.com',
        env_name: 'uat'
    },
    production: {
        mongodb_uri: process.env.PROD_MONGODB_URI,
        frontend_url: process.env.PROD_FRONTEND_URL || 'https://capisafety.com',
        backend_url: process.env.PROD_BACKEND_URL || 'https://api.capisafety.com',
        env_name: 'production'
    }
};

const getCurrentEnvironment = () => {
    const env = process.env.NODE_ENV || 'development';
    return environments[env] || environments.development;
};

module.exports = {
    environments,
    getCurrentEnvironment
}; 