const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { requireAuth } = require('../auth/middleware');

// public tutor profiles
// router.get('/:userId', controller.getProfileById); // you already have this

// logged-in user's own profile
router.get('/me', requireAuth, controller.getMyProfile);
router.patch('/me', requireAuth, controller.updateMyProfile);

module.exports = router;