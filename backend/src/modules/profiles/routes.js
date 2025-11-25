// backend/src/modules/profiles/routes.js
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { requireAuth } = require('../auth/middleware');

// logged-in user's own profile
router.get('/me', requireAuth, controller.getMyProfile);
router.patch('/me', requireAuth, controller.updateMyProfile);

// public tutor profiles by userId
router.get('/:userId', controller.getProfileById);

module.exports = router;
