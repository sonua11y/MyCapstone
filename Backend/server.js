const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Debug environment variables at startup
console.log('Server startup - Environment variables:', {
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
  SESSION_SECRET: process.env.SESSION_SECRET ? 'Set' : 'Not set',
  MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not set'
});

// Load watcher only in development environment
if (process.env.NODE_ENV !== 'production') {
  try {
    require('./watcher');
    console.log('CSV Watcher started in development mode');
  } catch (error) {
    console.log('CSV Watcher not loaded (development only feature)');
  }
}

// If JWT_SECRET is not set, use a fallback (only for development)
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set in .env file. Using development fallback.');
  process.env.JWT_SECRET = 'development-secret-key-please-change-in-production';
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes'); // Importing routes
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes'); // Add this line
const passport = require('passport');
const session = require('express-session');
require('./config/passport');
const otpRoutes = require('./routes/otpRoutes');


const app = express();
const port = 5000;

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24 hours
}));

app.use(express.json());

// If SESSION_SECRET is not set, use a fallback (only for development)
if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET not set in .env file. Using development fallback.');
  process.env.SESSION_SECRET = 'development-session-secret-key';
}

// Add session middleware with more secure settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// **MongoDB Connection**
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI is set' : 'URI is missing');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB().then(() => {
  // Start server only after DB connection is established
  app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
    console.log('Environment:', process.env.NODE_ENV);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// **Use Student Routes**
app.use('/students', studentRoutes);
app.use('/auth', authRoutes);
app.use('/otp', otpRoutes);
app.use('/content', contentRoutes);

// Routes
app.get('/students/all', async (req, res) => {
  try {
    // TODO: Replace with actual database query
    const students = [
      {
        firstName: "John",
        lastName: "Doe",
        college: "MIT",
        transactionId: "12345",
        feePaid: "Yes",
        semFee: "Yes",
        uploadDate: "2024-03-20",
        dateOfPayment: "2024-03-19"
      },
      // Add more sample data or connect to your database
    ];
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method
  });
  
  // Send more detailed error response
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    path: req.path
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
