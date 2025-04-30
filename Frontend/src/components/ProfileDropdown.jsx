import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { User, LogOut, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import EditProfile from './EditProfile';
import '../styles/ProfileDropdown.css';

const ProfileDropdown = ({ user }) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };

  const handleSaveProfile = (updatedData) => {
    const currentUserData = JSON.parse(localStorage.getItem('userData')) || {};
    const newUserData = {
      ...currentUserData,
      ...updatedData
    };
    localStorage.setItem('userData', JSON.stringify(newUserData));
    window.location.reload(); // Refresh to show updated data
  };

  const formatLastLogin = (lastLoginStr) => {
    if (!lastLoginStr) return 'Just now';
    const date = new Date(lastLoginStr);
    if (isNaN(date.getTime())) return 'Just now';
    
    const formattedDate = date.toLocaleDateString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${formattedDate} ${hours}:${minutes}`;
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="profile-trigger">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="profile-image" />
            ) : (
              <User size={20} color="#fff" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="profile-dropdown" align="end" sideOffset={10}>
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="profile-image" />
              ) : (
                <User size={24} color="#fff" />
              )}
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{user?.name || 'Admin User'}</h3>
              <p className="profile-email">{user?.email || 'admin@example.com'}</p>
              <p className="profile-role">{user?.role || 'Super Admin'}</p>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">Last Login</span>
              <span className="stat-value">{formatLastLogin(user?.lastLogin)}</span>
            </div>
          </div>

          <div className="profile-actions">
            <Button variant="ghost" className="action-button" onClick={() => setIsEditProfileOpen(true)}>
              <Settings size={16} />
              <span>Edit Profile</span>
            </Button>
            <Button variant="ghost" className="action-button" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <EditProfile
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    </>
  );
};

export default ProfileDropdown; 