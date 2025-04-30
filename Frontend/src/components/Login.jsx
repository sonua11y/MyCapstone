import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import './Login.css';
import { FcGoogle } from 'react-icons/fc';
import OTPVerification from './OTPVerification';
import loginLogo from '../assets/login logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (error) {
      localStorage.setItem('loginError', error);
    } else {
      localStorage.removeItem('loginError');
    }
  }, [error]);

  useEffect(() => {
    // Check for error parameter in URL
    const errorType = searchParams.get('error');
    if (errorType === 'server_error') {
      setError('Server configuration error. Please try again later.');
    } else if (errorType === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const requestBody = {
        "Email id": email,
        "Password": password
      };
      console.log('Sending login request with:', requestBody);
      
      // First step: Validate credentials and send OTP
      const response = await fetch('http://localhost:5000/otp/login-init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // If credentials are valid, open OTP dialog
        console.log('%c🔐 Login successful!', 'color: #4CAF50; font-weight: bold; font-size: 12px');
        if (data.otp) {
          console.log('%c📱 Your OTP: ' + data.otp, 'color: #E91E63; font-weight: bold; font-size: 14px; background: #f3f3f3; padding: 4px 8px; border-radius: 4px;');
        } else {
          console.log('%c👉 Check your terminal for the OTP code', 'color: #2196F3; font-size: 12px');
        }
        setIsOTPDialogOpen(true);
      } else {
        console.error('Login failed:', data.message);
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    }
  };

  const handleOTPVerification = (token) => {
    // After successful OTP verification
    localStorage.removeItem('loginError');
    localStorage.setItem('token', token);
    window.location.href = '/dashboard';
  };

  const handleGoogleLogin = () => {
    try {
      setError(''); // Clear any existing errors
      console.log('Initiating Google login...');
      const googleAuthUrl = 'http://localhost:5000/auth/google';
      // Add state parameter to track the origin
      window.location.href = `${googleAuthUrl}?redirect_uri=${encodeURIComponent(window.location.origin)}`;
    } catch (err) {
      console.error('Error initiating Google login:', err);
      setError('Failed to initiate Google login. Please try again.');
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">
            <img src={loginLogo} alt="Login Logo" className="logo-image" />
          </div>
          
          <h1>Welcome Back</h1>
          <p className="subtitle">Enter your credentials to access your account.</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-icon">📧</div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">🔒</div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="sign-in-button">
              Sign In
            </button>
          </form>

          <div className="forgot-password">
            Forgot your password?{' '}
            <a href="/reset-password" className="reset-link">
              Reset Password
            </a>
          </div>

          <div className="or-divider">
            <span>OR</span>
          </div>
          
          <button 
            onClick={handleGoogleLogin}
            className="google-login-btn"
          >
            <FcGoogle className="google-icon" />
            Continue with Google
          </button>
        </div>
      </div>

      <OTPVerification
        isOpen={isOTPDialogOpen}
        onClose={() => setIsOTPDialogOpen(false)}
        email={email}
        onVerify={handleOTPVerification}
      />
    </>
  );
};

export default Login; 