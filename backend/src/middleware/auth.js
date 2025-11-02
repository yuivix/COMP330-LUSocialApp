// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = decoded; // { userId, email, role } from your login token
        next();
    });
}

// Middleware to enforce specific role (e.g., 'tutor' or 'student')
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: `Only ${role}s can perform this action` });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };