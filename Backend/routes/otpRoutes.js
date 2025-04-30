const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store OTPs temporarily (in production, use Redis or similar)
let otpStore = new Map();

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Initialize login and send OTP
router.post('/login-init', async (req, res) => {
  try {
    const { "Email id": email, "Password": password } = req.body;

    // Find user by email
    const user = await User.findOne({ "Email id": email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP
    otpStore.set(email, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Log the OTP (for testing only)
    console.log('Generated OTP for', email, ':', otp);
    console.log('Current OTP store:', Array.from(otpStore.entries()));

    res.json({ 
      success: true,
      message: 'OTP sent successfully',
      // Only include OTP in development
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });
  } catch (error) {
    console.error('Login init error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { "Email id": email, otp } = req.body;
    console.log('Verifying OTP for', email, 'with code', otp);
    console.log('Current OTP store:', Array.from(otpStore.entries()));

    const storedData = otpStore.get(email);
    
    if (!storedData) {
      console.log('No OTP found for', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired OTP' 
      });
    }

    if (Date.now() > storedData.expiry) {
      console.log('OTP expired for', email);
      otpStore.delete(email);
      return res.status(401).json({ 
        success: false,
        message: 'OTP expired' 
      });
    }

    if (storedData.otp !== otp) {
      console.log('Invalid OTP. Expected:', storedData.otp, 'Received:', otp);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid OTP' 
      });
    }

    // OTP is valid, generate token
    const user = await User.findOne({ "Email id": email });
    const token = jwt.sign(
      { 
        userId: user._id,
        admin: user.Admins,
        email: user["Email id"]
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Clear the used OTP
    otpStore.delete(email);
    console.log('OTP verified successfully for', email);

    res.json({
      success: true,
      token,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Clear expired OTPs every minute
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiry) {
      otpStore.delete(email);
    }
  }
}, 60 * 1000);

module.exports = router; 