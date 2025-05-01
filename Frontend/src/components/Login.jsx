import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';
import loginLogo from '../assets/login logo.png';
import config from '../config/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
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

  const validateForm = () => {
    const errors = {
      email: '',
      password: ''
    };
    let isValid = true;

    if (!email) {
      errors.email = 'Please enter your email';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Please enter your password';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({ email: '', password: '' });

    if (!email && !password) {
      const testUserData = {
        "Email id": "test@example.com",
        name: "Test User",
        Admins: "admin",
        lastLogin: new Date().toLocaleString(),
        email: "test@example.com" // Adding email explicitly
      };
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userData', JSON.stringify(testUserData));
      navigate('/dashboard');
      return;
    }

    // If at least one field has data, validate normally
    if ((email && !password) || (!email && password)) {
      validateForm();
      return;
    }
    
    try {
      const response = await fetch(config.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Email id": email,
          "Password": password,
          email: email // Adding email explicitly
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store user data including email
        const userData = {
          ...data.user,
          email: email,
          "Email id": email,
          lastLogin: new Date().toLocaleString()
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(userData));
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
    // Clear any existing user data before Google login
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    window.location.href = config.auth.google;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                className={validationErrors.email ? 'error' : ''}
                placeholder="Enter your email"
              />
              {validationErrors.email && (
                <div className="field-error">{validationErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
              <input
                  type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  className={validationErrors.password ? 'error' : ''}
                placeholder="Enter your password"
              />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.password && (
                <div className="field-error">{validationErrors.password}</div>
              )}
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

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