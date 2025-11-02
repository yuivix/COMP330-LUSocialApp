// backend/src/modules/bookings/routes.js
const router = require('express').Router();
const controller = require('./controller');
const { requireAuth } = require('../../middleware/auth');

// All booking routes require authentication
router.use(requireAuth);

// GET /bookings - Fetch bookings for the authenticated user
// Query params: role (student|tutor), status (optional)
router.get('/', controller.getBookings);

// POST /bookings - Create a new booking request (students only)
router.post('/', controller.createBooking);

// PUT /bookings/:id/accept - Accept a booking (tutors only)
router.put('/:id/accept', controller.acceptBooking);

module.exports = router;
