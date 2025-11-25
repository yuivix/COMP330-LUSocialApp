const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { requireAuth } = require('../auth/middleware');

router.get('/', requireAuth, controller.listForTutor);
router.post('/', requireAuth, controller.createReview);

module.exports = router;
