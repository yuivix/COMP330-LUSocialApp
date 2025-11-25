// backend/src/modules/bookings/routes.js
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { requireAuth } = require('../auth/middleware');

// Create a booking
router.post('/', requireAuth, controller.createBooking);

// Get bookings (student/tutor based on ?role=...)
router.get('/', requireAuth, controller.getBookingsByRole);

// Accept a booking (tutor only)
router.post('/:id/accept', requireAuth, controller.acceptBooking);

// Cancel a booking
router.post('/:id/cancel', requireAuth, controller.cancelBooking);

// ✅ NEW: Mark booking as COMPLETED (tutor only)
router.post('/:id/complete', requireAuth, controller.markBookingComplete);

module.exports = router;
