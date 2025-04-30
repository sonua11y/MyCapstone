import React, { useState } from 'react';
import './OTPVerification.css';

const OTPVerification = ({ isOpen, onClose, email, onVerify }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/otp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Email id": email,
          otp: otp
        }),
      });

      const data = await response.json();

      if (data.success) {
        onVerify(data.token);
      } else {
        setError(data.message);
        setOtp(''); // Clear invalid OTP
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    setError(''); // Clear error when user types
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && otp.length === 6) {
      handleVerify();
    }
  };

  return (
    <div className="otp-overlay">
      <div className="otp-modal" onClick={e => e.stopPropagation()}>
        <div className="otp-header">
          <h2>Enter Verification Code</h2>
          <p>Please check your email for the OTP</p>
        </div>

        <div className="otp-content">
          <p className="otp-description">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>

          {error && <div className="otp-error">{error}</div>}

          <div className="otp-input-container">
            <input
              type="text"
              value={otp}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter 6-digit code"
              className="otp-input"
              autoFocus
              maxLength="6"
            />
          </div>

          <div className="otp-actions">
            <button
              onClick={handleVerify}
              className="verify-button"
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
