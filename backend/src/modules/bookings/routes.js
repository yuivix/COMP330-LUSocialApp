const express = require('express');
const router = express.Router();
const c = require('./controller');

// Create booking
router.post('/', c.createBooking);

// Get bookings by role (student/tutor)
router.get('/', c.getBookingsByRole);

module.exports = router;