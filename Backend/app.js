const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');
const UpdateTracker = require('./services/updateTracker');
const { getCurrentEnvironment } = require('./config/environments');

const app = express();
const env = getCurrentEnvironment();

// Middleware
app.use(cors({
    origin: env.frontend_url,
    credentials: true
}));
app.use(express.json());

// Add environment indicator header
app.use((req, res, next) => {
    res.setHeader('X-Environment', env.env_name);
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Connect to MongoDB
mongoose.connect(env.mongodb_uri)
    .then(() => {
        console.log(`Connected to MongoDB (${env.env_name} environment)`);
        console.log(`Database: ${mongoose.connection.db.databaseName}`);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Initialize change streams after MongoDB connection
mongoose.connection.once('open', async () => {
    console.log('Setting up change streams...');
    await UpdateTracker.setupChangeStream('Admin Users');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        environment: env.env_name,
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

module.exports = app; 