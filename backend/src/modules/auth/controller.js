const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const svc = require('./service');

const isEduEmail = e => /\.edu$/i.test(String(e || '').trim());
const strongPw = p => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p || '');

async function register(req, res, next) {
    try {
        const { email, password, role } = req.body || {};

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, role required' });
        }

        if (!isEduEmail(email)) {
            return res.status(400).json({ error: 'Must use a .edu email address' });
        }

        if (!strongPw(password)) {
            return res.status(400).json({ error: 'Password must have 8+ chars incl. upper, lower, number' });
        }

        if (!['student', 'tutor'].includes(role)) {
            return res.status(400).json({ error: 'Role must be student or tutor' });
        }

        const existing = await svc.findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(24).toString('hex');

        const user = await svc.createUser(email, passwordHash, role, verificationToken);

        res.status(201).json({
            message: 'Registered. Verify via token.',
            userId: user.user_id,
            devVerificationToken: verificationToken
        });
    } catch (e) {
        next(e);
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