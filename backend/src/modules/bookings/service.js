const pool = require('../../db/connection');

// Create booking
async function createBooking(studentId, listingId, start, end, note) {
    const tutorQuery = `
    SELECT tutor_id FROM tutor_listings WHERE listing_id = $1
  `;
    const { rows: tutors } = await pool.query(tutorQuery, [listingId]);
    if (!tutors.length) throw new Error('Listing not found');
    const tutorId = tutors[0].tutor_id;

    // Conflict check
    const conflictQ = `
    SELECT 1 FROM bookings
    WHERE tutor_id = $1
      AND status != 'CANCELLED'
      AND (
        (session_date, session_date + (duration_minutes || ' minute')::interval)
        OVERLAPS ($2::timestamp, $3::timestamp)
      )
  `;
    const conflict = await pool.query(conflictQ, [tutorId, start, end]);
    if (conflict.rows.length) {
        const err = new Error('Tutor not available');
        err.code = '409';
        throw err;
    }

    const insertQ = `
    INSERT INTO bookings (student_id, tutor_id, listing_id, session_date, duration_minutes, notes, status)
    VALUES ($1, $2, $3, $4, EXTRACT(EPOCH FROM ($5::timestamp - $4::timestamp))/60, $6, 'PENDING')
    RETURNING booking_id AS id, student_id, tutor_id, listing_id, session_date, duration_minutes
  `;
    const { rows } = await pool.query(insertQ, [studentId, tutorId, listingId, start, end, note]);
    return rows[0];
}

// Fetch bookings by role
async function getBookingsByRole(userId, role) {
    let q;
    if (role === 'student') {
        q = `
      SELECT b.booking_id AS id, b.listing_id, t.subject AS listing_title,
             b.session_date AS start_time,
             (b.session_date + (b.duration_minutes || ' minute')::interval) AS end_time,
             b.status
      FROM bookings b
      JOIN tutor_listings t ON t.listing_id = b.listing_id
      WHERE b.student_id = $1
      ORDER BY b.session_date ASC
    `;
    } else {
        q = `
      SELECT b.booking_id AS id, b.listing_id, 
             u.email AS student_email,
             t.subject AS listing_title,
             t.course_code,
             b.session_date AS start_time,
             (b.session_date + (b.duration_minutes || ' minute')::interval) AS end_time,
             b.status, b.notes
      FROM bookings b
      JOIN users u ON u.user_id = b.student_id
      JOIN tutor_listings t ON t.listing_id = b.listing_id
      WHERE b.tutor_id = $1
      ORDER BY b.session_date ASC
    `;
    }
    const { rows } = await pool.query(q, [userId]);
    return rows;
}

// Accept booking (tutor only)
async function acceptBooking(bookingId, tutorId) {
    // Verify tutor owns this booking
    const checkQ = `
        SELECT tutor_id FROM bookings WHERE booking_id = $1
    `;
    const { rows } = await pool.query(checkQ, [bookingId]);

    if (!rows.length) {
        const err = new Error('Booking not found');
        err.code = '404';
        throw err;
    }

    if (rows[0].tutor_id !== tutorId) {
        const err = new Error('Not authorized to accept this booking');
        err.code = '403';
        throw err;
    }

    // Update status to CONFIRMED
    const updateQ = `
        UPDATE bookings 
        SET status = 'CONFIRMED', updated_at = NOW()
        WHERE booking_id = $1
        RETURNING booking_id AS id, student_id, tutor_id, listing_id, 
                  session_date AS start_time,
                  (session_date + (duration_minutes || ' minute')::interval) AS end_time,
                  status
    `;
    const { rows: updated } = await pool.query(updateQ, [bookingId]);
    return updated[0];
}

// Cancel booking
async function cancelBooking(bookingId, userId) {
    // Verify user owns this booking (either as student or tutor)
    const checkQ = `
        SELECT student_id, tutor_id FROM bookings WHERE booking_id = $1
    `;
    const { rows } = await pool.query(checkQ, [bookingId]);

    if (!rows.length) {
        const err = new Error('Booking not found');
        err.code = '404';
        throw err;
    }

    if (rows[0].student_id !== userId && rows[0].tutor_id !== userId) {
        const err = new Error('Not authorized to cancel this booking');
        err.code = '403';
        throw err;
    }

    // Update status to CANCELLED
    const updateQ = `
        UPDATE bookings 
        SET status = 'CANCELLED', updated_at = NOW()
        WHERE booking_id = $1
        RETURNING booking_id AS id, student_id, tutor_id, listing_id, 
                  session_date AS start_time,
                  (session_date + (duration_minutes || ' minute')::interval) AS end_time,
                  status
    `;
    const { rows: updated } = await pool.query(updateQ, [bookingId]);
    return updated[0];
}

module.exports = { createBooking, getBookingsByRole, acceptBooking, cancelBooking };