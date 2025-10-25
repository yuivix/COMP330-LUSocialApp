// backend/src/modules/profiles/routes.js
const router = require('express').Router();
router.get('/:userId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.put('/:userId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
module.exports = router;
