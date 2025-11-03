const express = require('express');
const router = express.Router();
const c = require('./controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

// Create booking (student only)
router.post('/', requireAuth, requireRole('student'), c.createBooking);

// Get bookings by role
router.get('/', requireAuth, c.getBookingsByRole);

// Accept booking (tutor only)
router.put('/:id/accept', requireAuth, requireRole('tutor'), c.acceptBooking);

module.exports = router;