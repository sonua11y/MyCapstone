const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StudentData', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function createTestAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ "Email id": "admin1@gmail.com" });
        if (existingAdmin) {
            console.log('Admin already exists, deleting...');
            await User.deleteOne({ "Email id": "admin1@gmail.com" });
        }

        // Create new admin - password will be automatically hashed by the model
        const admin = new User({
            "Email id": "admin1@gmail.com",
            Password: "iamadmin@1", // This will be automatically hashed
            Admins: true
        });

        await admin.save();
        console.log('Test admin created successfully');
        
        // Verify the admin was created
        const createdAdmin = await User.findOne({ "Email id": "admin1@gmail.com" });
        console.log('Created admin:', {
            email: createdAdmin["Email id"],
            isAdmin: createdAdmin.Admins
        });

        process.exit(0);
    } catch (error) {
        console.error('Error creating test admin:', error);
        process.exit(1);
    }
}

createTestAdmin(); 