// backend/src/modules/listings/routes.js
const r = require('express').Router();
const c = require('./controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

r.post('/', requireAuth, requireRole('tutor'), c.create); // tutor-only
r.get('/', c.search);                                     // public

module.exports = r;