// backend/src/modules/bookings/routes.js
const router = require('express').Router();
router.post('/', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.get('/', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.patch('/:id', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
module.exports = router;
