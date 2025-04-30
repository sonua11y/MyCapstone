const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/auth/google/callback",
            passReqToCallback: true
        },
        async function(req, accessToken, refreshToken, profile, done) {
            try {
                console.log('Google authentication started');
                console.log('Profile:', {
                    id: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName
                });
                
                // Check if user already exists
                let user = await User.findOne({ 
                    $or: [
                        { "Email id": profile.emails[0].value },
                        { googleId: profile.id }
                    ]
                });
                
                if (!user) {
                    console.log('Creating new user');
                    // Create new user if doesn't exist
                    user = await User.create({
                        "Email id": profile.emails[0].value,
                        googleId: profile.id,
                        Admins: false // Set default role as boolean
                    });
                    console.log('New user created:', {
                        id: user._id,
                        email: user["Email id"],
                        admin: user.Admins
                    });
                } else {
                    console.log('User found:', {
                        id: user._id,
                        email: user["Email id"],
                        admin: user.Admins
                    });
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        // Ensure Admins is boolean
                        if (typeof user.Admins !== 'boolean') {
                            user.Admins = false;
                        }
                        await user.save();
                        console.log('Updated existing user with Google ID');
                    }
                }

                return done(null, user);
            } catch (error) {
                console.error('Error in Google Strategy:', error);
                return done(error, null);
            }
        }
    )
);

// Serialize the user for the session
passport.serializeUser((user, done) => {
    console.log('Serializing user:', user._id);
    done(null, user._id);
});

// Deserialize the user from the session
passport.deserializeUser(async (id, done) => {
    try {
        console.log('Deserializing user:', id);
        const user = await User.findById(id);
        if (!user) {
            console.log('User not found during deserialization');
            return done(null, false);
        }
        console.log('User deserialized successfully');
        done(null, user);
    } catch (error) {
        console.error('Error deserializing user:', error);
        done(error, null);
    }
});

module.exports = passport; 