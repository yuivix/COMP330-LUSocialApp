// backend/src/modules/bookings/routes.js
const router = require('express').Router();
const { requireAuth, requireRole } = require('../../middleware/auth');
const c = require('./controller');

// Create booking (student)
router.post('/', requireAuth, requireRole('student'), c.createBooking);

// List bookings (mine)
router.get('/', requireAuth, c.listBookings);

// Accept booking (tutor)
router.put('/:id/accept', requireAuth, requireRole('tutor'), c.acceptBooking);

module.exports = router;
