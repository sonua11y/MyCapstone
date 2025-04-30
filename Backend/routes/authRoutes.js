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

const otpMap = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Access denied' });

  const otp = generateOTP();
  const expiresAt = Date.now() + 2 * 60 * 1000;
  otpMap.set(email, { otp, expiresAt });

  console.log(`OTP for ${email}: ${otp}`);
  res.status(200).json({ message: 'OTP sent to email' });
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const record = otpMap.get(email);

  if (!record || Date.now() > record.expiresAt || record.otp !== otp) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  otpMap.delete(email);

  res.status(200).json({ token });
});

router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = generateOTP();
  const expiresAt = Date.now() + 2 * 60 * 1000;
  otpMap.set(email, { otp, expiresAt });

  console.log(`Resent OTP to ${email}: ${otp}`);
  res.status(200).json({ message: 'OTP resent' });
});

router.post('/create-admin', async (req, res) => {
  const { secret } = req.headers;
  if (secret !== process.env.CREATE_ADMIN_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Admin already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, admin: true });
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
      const isAdmin = req.user.Admins === true;

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

setInterval(() => {
  const now = Date.now();
  for (const [email, { expiresAt }] of otpMap.entries()) {
    if (now > expiresAt) otpMap.delete(email);
  }
}, 60 * 1000);

module.exports = router;
