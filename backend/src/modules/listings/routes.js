// backend/src/modules/listings/routes.js
const router = require('express').Router();
router.post('/', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.get('/:id', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
module.exports = router;
