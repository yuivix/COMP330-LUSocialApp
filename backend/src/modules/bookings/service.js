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
      AND status != 'cancelled'
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
    INSERT INTO bookings (student_id, tutor_id, listing_id, session_date, duration_minutes, notes)
    VALUES ($1, $2, $3, $4, EXTRACT(EPOCH FROM ($5::timestamp - $4::timestamp))/60, $6)
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
      SELECT b.booking_id AS id, b.listing_id, u.email AS student_email,
             b.session_date AS start_time,
             (b.session_date + (b.duration_minutes || ' minute')::interval) AS end_time,
             b.status
      FROM bookings b
      JOIN users u ON u.user_id = b.student_id
      WHERE b.tutor_id = $1
      ORDER BY b.session_date ASC
    `;
    }
    const { rows } = await pool.query(q, [userId]);
    return rows;
}

module.exports = { createBooking, getBookingsByRole };