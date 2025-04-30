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

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://studentsadmissiontracker.netlify.app',
  'https://studentsadmissiontracker.netlify.app'
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
    console.log(`Server running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// **Use Routes**
app.use('/students', studentRoutes);
app.use('/auth', authRoutes);
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
