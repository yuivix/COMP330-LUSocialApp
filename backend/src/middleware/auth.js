// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [, token] = auth.split(' ');
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { requireAuth, requireRole };
