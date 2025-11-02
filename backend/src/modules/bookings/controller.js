// backend/src/modules/bookings/controller.js
const service = require('./service');

/**
 * GET /bookings
 * Fetch bookings for the authenticated user
 * Query params: role (student|tutor), status (optional)
 */
async function getBookings(req, res) {
  try {
    const userId = req.user.userId;
    const role = req.query.role || req.user.role; // Use query param or default to user's role
    const status = req.query.status; // Optional status filter

    if (!['student', 'tutor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "student" or "tutor"' });
    }

    const bookings = await service.getBookings(userId, role, status);
    return res.json(bookings);
  } catch (error) {
    console.error('Error in getBookings controller:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

/**
 * POST /bookings
 * Create a new booking request
 * Body: { listing_id, start_time, end_time, note? }
 */
async function createBooking(req, res) {
  try {
    const studentId = req.user.userId;
    const { listing_id, start_time, end_time, note } = req.body;

    // Validation
    if (!listing_id || !start_time || !end_time) {
      return res.status(400).json({ 
        error: 'Missing required fields: listing_id, start_time, end_time' 
      });
    }

    // Ensure user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ 
        error: 'Only students can create booking requests' 
      });
    }

    // Create the booking
    const booking = await service.createBooking(
      studentId, 
      listing_id, 
      start_time, 
      end_time, 
      note
    );

    // Fetch the full booking details including listing title
    const fullBooking = await service.getBookingById(booking.booking_id);

    return res.status(201).json(fullBooking);
  } catch (error) {
    console.error('Error in createBooking controller:', error);
    
    if (error.message === 'Listing not found') {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    return res.status(500).json({ error: 'Failed to create booking' });
  }
}

/**
 * PUT /bookings/:id/accept
 * Accept a booking request (tutor only)
 */
async function acceptBooking(req, res) {
  try {
    const tutorId = req.user.userId;
    const bookingId = parseInt(req.params.id);

    // Ensure user is a tutor
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ 
        error: 'Only tutors can accept booking requests' 
      });
    }

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await service.acceptBooking(bookingId, tutorId);
    
    return res.json({ 
      message: 'Booking accepted successfully',
      booking 
    });
  } catch (error) {
    console.error('Error in acceptBooking controller:', error);
    
    if (error.message === 'Booking not found or already processed') {
      return res.status(404).json({ 
        error: 'Booking not found or already processed' 
      });
    }
    
    return res.status(500).json({ error: 'Failed to accept booking' });
  }
}

module.exports = {
  getBookings,
  createBooking,
  acceptBooking
};
