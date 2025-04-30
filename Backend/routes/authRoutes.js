// auth.js (Updated)
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Environment variables:', {
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
  SESSION_SECRET: process.env.SESSION_SECRET ? 'Set' : 'Not set'
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
    console.log('Initiating Google OAuth...');
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })(req, res, next);
  }
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('Google OAuth callback received');
    passport.authenticate('google', { 
      failureRedirect: 'http://localhost:3000/login?error=auth_failed',
      failureMessage: true 
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('Google authentication successful, user:', req.user);
      
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing in environment variables');
        return res.redirect('http://localhost:3000/login?error=server_error');
      }

      if (!req.user) {
        console.error('No user data available after authentication');
        return res.redirect('http://localhost:3000/login?error=auth_failed');
      }

      // Ensure admin status is boolean
      const isAdmin = req.user.Admins === "admin";

      // Generate JWT token
      const token = jwt.sign(
        { 
          email: req.user["Email id"],
          id: req.user._id,
          admin: isAdmin
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      console.log('JWT token generated successfully');
      
      // Redirect with token
      res.redirect(`http://localhost:3000/auth/success?token=${token}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

module.exports = router;
