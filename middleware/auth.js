const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            // Check if it's an API request (starts with /api)
            if (req.path.startsWith('/api')) {
                return res.status(401).json({ message: 'Access denied. No token provided.' });
            }
            // For web routes, redirect to login
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            if (req.path.startsWith('/api')) {
                return res.status(401).json({ message: 'Token invalid. User not found.' });
            }
            return res.redirect('/login');
        }

        req.user = user;
        next();
    } catch (error) {
        if (req.path.startsWith('/api')) {
            return res.status(401).json({ message: 'Token invalid.' });
        }
        res.redirect('/login');
    }
};

module.exports = auth;