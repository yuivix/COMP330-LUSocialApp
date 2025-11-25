// backend/src/modules/bookings/controller.js
const svc = require('./service');
const pool = require('../../db/connection');
const { sendEmail } = require('../../lib/email'); // logs-only adapter

// ----------------------
// Create a booking (student)
// ----------------------
async function createBooking(req, res, next) {
    try {
        const { listing_id, start_time, end_time, note } = req.body || {};
        const userId = req.user?.userId;   // from JWT
        const userEmail = req.user?.email; // from JWT payload

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!listing_id || !start_time || !end_time) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const booking = await svc.createBooking(
            userId,
            listing_id,
            start_time,
            end_time,
            note
        );

        // 🔔 Fake notification: booking-requested (logs only)
        if (userEmail) {
            sendEmail(userEmail, 'booking-requested', {
                bookingId: booking.booking_id,
                listingId: booking.listing_id,
                startTime: booking.session_date || start_time,
            });
        }

        res.status(201).json(booking);
    } catch (err) {
        if (err.code === '409') {
            return res.status(409).json({ error: 'Tutor not available' });
        }
        next(err);
    }
}

// ----------------------
// Get bookings by role (student/tutor)
// ----------------------
async function getBookingsByRole(req, res, next) {
    try {
        const { role } = req.query;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const bookings = await svc.getBookingsByRole(userId, role);
        res.json(bookings);
    } catch (err) {
        next(err);
    }
}

// ----------------------
// Accept booking (tutor only)
// ----------------------
async function acceptBooking(req, res) {
    try {
        const { id } = req.params;
        const tutorId = req.user.userId;   // from JWT
        const tutorEmail = req.user.email; // from JWT

        const booking = await svc.acceptBooking(id, tutorId);

        // 🔔 Fake notification: booking-accepted (logs only)
        if (tutorEmail) {
            sendEmail(tutorEmail, 'booking-accepted', {
                bookingId: booking.booking_id,
                listingId: booking.listing_id,
                status: booking.status,
            });
        }

        res.json(booking);
    } catch (error) {
        if (error.code === '404') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === '403') {
            return res.status(403).json({ error: error.message });
        }
        console.error('Accept booking error:', error);
        res.status(500).json({ error: 'Failed to accept booking' });
    }
}

// ----------------------
// Cancel booking (student or tutor depending on svc logic)
// ----------------------
async function cancelBooking(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.userId; // From JWT token

        const booking = await svc.cancelBooking(id, userId);
        res.json(booking);
    } catch (error) {
        if (error.code === '404') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === '403') {
            return res.status(403).json({ error: error.message });
        }
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
}

// ----------------------
// Mark booking as COMPLETED (tutor only)
// ----------------------
async function markBookingComplete(req, res, next) {
    try {
        const bookingId = Number(req.params.id);
        const currentUserId = req.user.userId;

        if (!bookingId) {
            return res.status(400).json({ error: 'Invalid booking id' });
        }

        // 1. Get booking
        const { rows } = await pool.query(
            `SELECT booking_id, student_id, tutor_id, status
       FROM bookings
       WHERE booking_id = $1`,
            [bookingId]
        );
        const booking = rows[0];

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // 2. Only the tutor can complete it
        if (booking.tutor_id !== currentUserId) {
            return res.status(403).json({ error: 'Only the tutor can complete this booking' });
        }

        // 3. Status guards
        if (booking.status === 'COMPLETED') {
            return res.status(200).json({ message: 'Booking already completed' });
        }

        // Allowed transition: CONFIRMED → COMPLETED
        if (!['CONFIRMED'].includes(booking.status)) {
            return res.status(400).json({ error: 'Only confirmed bookings can be completed' });
        }

        // 4. Update to COMPLETED
        const { rows: updated } = await pool.query(
            `UPDATE bookings
       SET status = 'COMPLETED', updated_at = NOW()
       WHERE booking_id = $1
       RETURNING booking_id, status, student_id, tutor_id`,
            [bookingId]
        );

        res.json({ booking: updated[0] });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createBooking,
    getBookingsByRole,
    acceptBooking,
    cancelBooking,
    markBookingComplete,
};
