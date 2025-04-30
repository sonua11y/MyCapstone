const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const MONGODB_URI = process.env.MONGODB_URI || (process.env.NODE_ENV === 'development' ? 'mongodb://localhost:27017/StudentData' : process.env.PROD_MONGODB_URI);
const FRONTEND_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.FRONTEND_URL;

// Middleware
app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const otpRoutes = require('./routes/otpRoutes');

app.use('/auth', authRoutes);
app.use('/auth', otpRoutes);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 