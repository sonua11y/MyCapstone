import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import '../styles/EditProfile.css';

const EditProfile = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setPreviewUrl(user.profilePicture || null);
      setProfilePicture(null); // Reset file input
    }
  }, [isOpen, user]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      name,
      profilePicture: previewUrl
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="edit-profile-dialog">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="profile-form">
          <div className="profile-picture-section">
            <div className="profile-picture-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" />
              ) : (
                <div className="profile-picture-placeholder">
                  <span>No image</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="upload-button"
            >
              Upload Picture
            </Button>
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-actions">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile; 