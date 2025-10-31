// backend/src/modules/auth/routes.js
// Auth module routes - handles user registration, login, and email verification

const router = require('express').Router();
const c = require('./controller');

// POST /auth/register
// Create a new user account with .edu email
// Request body: { email, password, role }
// Returns: { message, userId, devVerificationToken }
router.post('/register', c.register);

// POST /auth/login
// Authenticate user and return JWT token
// Request body: { email, password }
// Returns: { token, userId, email, role }
router.post('/login', c.login);

// POST /auth/verify
// Verify user's email address using token
// Request body: { token }
// Returns: { message }
router.post('/verify', c.verify);

module.exports = router;