const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    "Email id": {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: function() {
            return !this.googleId; // Password is required only if not a Google user
        }
    },
    Admins: {
        type: String,
        default: "admin"
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows null values for non-Google users
    },
    name: {
        type: String,
        required: false
    }
}, { collection: 'Admin Users' });

// Method to compare password
userSchema.methods.comparePassword = function(candidatePassword) {
    // Direct string comparison since passwords are stored as plain text
        return candidatePassword === this.Password;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 