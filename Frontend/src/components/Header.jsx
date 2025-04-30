import React, { useEffect, useState } from 'react';
import '../styles/Header.css';
import "../styles/app.css";
import kalviumLogo from '../assets/Logo as.png';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      // Add last login time if it doesn't exist
      if (!userData.lastLogin) {
        userData.lastLogin = new Date().toLocaleString();
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      setUser(userData);
    }
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <img src={kalviumLogo} alt="Kalvium Logo" className="kalvium-logo logo" />
        <h1 className="header-title">Student Admission Tracker</h1>
      </div>
      <ProfileDropdown user={user} />
    </header>
  );
};

export default Header; 