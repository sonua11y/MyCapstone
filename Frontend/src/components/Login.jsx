import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css';
import { FcGoogle } from 'react-icons/fc';
import loginLogo from '../assets/login logo.png';
import config from '../config/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
      const response = await fetch(config.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Email id": email,
          "Password": password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = config.auth.google;
  };

  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <img src={loginLogo} alt="Login Logo" className="login-logo" />
            <h1>Welcome Back</h1>
            <p>Please enter your details to login</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

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
              type="button"
            onClick={handleGoogleLogin}
            className="google-login-btn"
          >
            <FcGoogle className="google-icon" />
            Continue with Google
          </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login; 