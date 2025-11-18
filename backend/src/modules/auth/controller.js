const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const svc = require('./service');

const isEduEmail = e => /\.edu$/i.test(String(e || '').trim());
const strongPw = p => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p || '');

async function register(req, res, next) {
    try {
        console.log('Registration request received:', req.body);
        const { email, password, role } = req.body || {};

        // Basic validation
        if (!email || !password || !role) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        // Hash password and create verification token
        const passwordHash = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(24).toString('hex');

        // Create user
        try {
            const user = await svc.createUser(email, passwordHash, role, verificationToken);
            console.log('User created successfully:', { userId: user.user_id, email: user.email });

            // Return success response
            res.status(201).json({
                message: 'Registration successful',
                userId: user.user_id,
                email: user.email,
                role: user.role
            });
        } catch (error) {
            console.error('Failed to create user:', error);
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Email already registered' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await svc.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // if (!user.is_verified) {
        //     return res.status(403).json({ error: 'Please verify your email before logging in' });
        // }

        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            userId: user.user_id,
            email: user.email,
            role: user.role
        });
    } catch (e) {
        next(e);
    }
}

async function verify(req, res, next) {
    try {
        const { token } = req.body || {};

        if (!token) {
            return res.status(400).json({ error: 'Verification token required' });
        }

        const u = await svc.verifyUserByToken(token);
        if (!u) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (e) {
        next(e);
    }
}

module.exports = { register, login, verify };