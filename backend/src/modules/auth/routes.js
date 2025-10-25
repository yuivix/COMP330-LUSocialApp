// backend/src/modules/auth/routes.js
const router = require('express').Router();
// e.g., POST /auth/register (not implemented yet)
router.post('/register', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/login', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/verify', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
module.exports = router;
