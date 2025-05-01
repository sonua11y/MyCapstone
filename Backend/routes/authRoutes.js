// auth.js (Updated)
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
const passport = require('passport');

// Load environment variables
dotenv.config();

const FRONTEND_URL = process.env.NODE_ENV === 'production'
    ? 'https://deployadmissiontracker.netlify.app'
    : 'http://localhost:3000';

// Debug environment variables and configuration
console.log('Auth Routes Configuration:', {
  frontendUrl: FRONTEND_URL,
  environment: process.env.NODE_ENV,
  nodeVersion: process.version,
  currentUrl: process.env.NODE_ENV === 'production' 
    ? 'https://mycapstone-3.onrender.com' 
    : 'http://localhost:5000'
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body["Email id"];
    const password = req.body["Password"];
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ "Email id": email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Direct password comparison since they're stored as plain text
    const validPassword = password === user.Password;
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
  }

    const token = jwt.sign(
      { 
        email: user["Email id"],
        id: user._id,
        name: user.name || email.split('@')[0], // Use name if exists, otherwise use part before @
        admin: user.Admins === "admin"
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

  res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/create-admin', async (req, res) => {
  const { secret } = req.headers;
  if (secret !== process.env.CREATE_ADMIN_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const email = req.body["Email id"];
  const password = req.body["Password"];

  const existing = await User.findOne({ "Email id": email });
  if (existing) return res.status(400).json({ message: 'Admin already exists' });

  const user = new User({ 
    "Email id": email, 
    "Password": password,
    "Admins": "admin"
  });
  await user.save();

  res.status(201).json({ message: 'Admin created' });
});

// Google OAuth Routes
router.get('/google',
  (req, res, next) => {
    console.log('Initiating Google OAuth...', {
      environment: process.env.NODE_ENV,
      headers: req.headers,
      originalUrl: req.originalUrl
    });
    
    passport.authenticate('google', { 
      scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
      prompt: 'select_account',
      accessType: 'offline',
      includeGrantedScopes: true
    })(req, res, next);
  }
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('Received callback request:', {
      query: req.query,
      headers: req.headers,
      originalUrl: req.originalUrl
    });
    next();
  },
    passport.authenticate('google', { 
    failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
    session: false
  }),
  async (req, res) => {
    try {
      console.log('Google callback authentication successful');
      
      if (!req.user) {
        console.error('No user data in callback');
        return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
      }

      const token = jwt.sign({
        id: req.user._id,
        email: req.user["Email id"],
        name: req.user.name || req.user.displayName,
        admin: req.user.Admins
      }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      if (!token) {
        console.error('Failed to generate token');
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }

      const redirectUrl = `${FRONTEND_URL}/auth/success?token=${token}`;
      console.log('Auth successful, redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

module.exports = router;
