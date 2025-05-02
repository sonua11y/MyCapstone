const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Debug environment variables at startup
console.log('Server startup - Environment variables:', {
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
  SESSION_SECRET: process.env.SESSION_SECRET ? 'Set' : 'Not set',
  MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not set',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

// Set environment based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// Load watcher in development environment
try {
  require('./watcher');
  console.log('CSV Watcher initialized');
} catch (error) {
  console.error('Error loading CSV Watcher:', error);
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
const fs = require('fs');
const Student = require('./models/Student'); // Import the Student model with correct casing

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',  // Development    // New Netlify domain
  'https://kalstudentadmissiontracker.netlify.app', // New frontend domain
  'https://mycapstone-3.onrender.com'  // Backend itself
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Root route to show server status
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Backend Server Status</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f2f5;
          }
          .container {
            text-align: center;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #1a237e;
            margin-bottom: 10px;
          }
          .status {
            color: #4caf50;
            font-size: 18px;
          }
          .timestamp {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Backend Server</h1>
          <p class="status">✅ Server is running</p>
          <p class="timestamp">Last checked: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);
});

// Test route for CORS
app.get('/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS Test Endpoint',
    origin: req.headers.origin || 'No origin header',
    headers: req.headers,
    allowedOrigins: allowedOrigins,
    environment: process.env.NODE_ENV,
    frontendUrl: 'https://studentsadmissiontracker.netlify.app'
  });
});

// Health check endpoint with more details
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

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

// Add last-update endpoint
app.get('/api/last-update', (req, res) => {
  const filePath = process.env.CSV_PATH;
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      res.json({
        lastModified: stats.mtime.toLocaleDateString('en-GB')
      });
    } else {
      res.status(404).json({
        message: 'CSV file not found'
      });
    }
  } catch (err) {
    res.status(500).json({
      message: 'Error checking file',
      error: err.message
    });
  }
});

// **MongoDB Connection**
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/StudentData';
    console.log('MongoDB URI:', mongoUri ? 'URI is set' : 'URI is missing');
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Set CSV path for development
process.env.CSV_PATH = 'C:\\Users\\sripr\\Downloads\\My Mock Data.csv';
console.log('Using CSV path:', process.env.CSV_PATH);

connectDB().then(() => {
  // Start server only after DB connection is established
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('CSV Path:', process.env.CSV_PATH);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  // Don't exit, let the retry mechanism work
  // process.exit(1);
});

// **Use Routes**
app.use('/students', studentRoutes);
app.use('/auth', authRoutes);
app.use('/content', contentRoutes);

// Routes
app.get('/students/all', async (req, res) => {
  try {
    const students = await Student.find({});
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Test HTML page for CORS
app.get('/test-cors-page', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CORS Test Page</title>
        <script>
          async function testCors() {
            try {
              // Make a request to a different endpoint
              const response = await fetch('https://mycapstone-2.onrender.com/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  "Email id": "test@example.com",
                  "Password": "test123"
                })
              });
              const data = await response.json();
              document.getElementById('result').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
              document.getElementById('result').textContent = 'Error: ' + error.message;
            }
          }
        </script>
      </head>
      <body>
        <h1>CORS Test Page</h1>
        <button onclick="testCors()">Test CORS</button>
        <pre id="result"></pre>
      </body>
    </html>
  `);
});

// Test CORS headers endpoint
app.get('/test-cors-headers', (req, res) => {
  // Set CORS headers manually
  res.setHeader('Access-Control-Allow-Origin', 'https://studentsadmissiontracker.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  res.json({
    message: 'CORS Headers Test',
    origin: req.headers.origin,
    headers: req.headers
  });
});

// Handle OPTIONS request for CORS
app.options('/test-cors-headers', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://studentsadmissiontracker.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Test route for file modification time
app.get('/test-file-time', (req, res) => {
  const filePath = process.env.CSV_PATH || path.join(__dirname, 'data', 'mock-data.csv');
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      res.json({
        message: 'File modification time',
        mtime: stats.mtime,
        formattedDate: stats.mtime.toLocaleDateString('en-GB'),
        filePath: filePath
      });
    } else {
      res.status(404).json({
        message: 'File not found',
        filePath: filePath
      });
    }
  } catch (err) {
    res.status(500).json({
      message: 'Error checking file',
      error: err.message,
      filePath: filePath
    });
  }
});

// Configure CSV path for production
if (process.env.NODE_ENV === 'production') {
  const csvPath = process.env.CSV_PATH;
  if (!csvPath) {
    console.warn('Warning: CSV_PATH environment variable not set in production');
  } else {
    console.log('Production CSV path:', csvPath);
  }
}

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
