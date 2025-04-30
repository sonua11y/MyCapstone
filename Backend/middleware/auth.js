const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', decoded); // Temporary log
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth error:', error); // Temporary log
        res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = auth; 