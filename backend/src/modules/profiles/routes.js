const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

// GET /profiles/:userId  (public read)
router.get('/:userId', ctrl.getProfileById);

module.exports = router;
