// backend/src/modules/bookings/service.js
const pool = require('../../db/connection');

/**
 * Get bookings filtered by role and optionally by status
 * @param {number} userId - The user's ID
 * @param {string} role - Either 'student' or 'tutor'
 * @param {string} status - Optional status filter (e.g., 'pending', 'confirmed')
 */
async function getBookings(userId, role, status) {
  try {
    let query;
    let params;

    if (role === 'student') {
      // Get bookings where user is the student
      query = `
        SELECT 
          b.booking_id as id,
          b.booking_id,
          b.listing_id,
          b.student_id,
          b.tutor_id,
          b.session_date as start_time,
          b.session_date + (b.duration_minutes * INTERVAL '1 minute') as end_time,
          b.duration_minutes,
          b.status,
          b.notes,
          b.created_at,
          b.updated_at,
          tl.title as listing_title,
          tl.subject,
          tu.email as tutor_email,
          tp.first_name as tutor_first_name,
          tp.last_name as tutor_last_name
        FROM bookings b
        JOIN tutor_listings tl ON b.listing_id = tl.listing_id
        JOIN users tu ON b.tutor_id = tu.user_id
        LEFT JOIN profiles tp ON b.tutor_id = tp.user_id
        WHERE b.student_id = $1
      `;
      params = [userId];
    } else if (role === 'tutor') {
      // Get bookings where user is the tutor
      query = `
        SELECT 
          b.booking_id as id,
          b.booking_id,
          b.listing_id,
          b.student_id,
          b.tutor_id,
          b.session_date as start_time,
          b.session_date + (b.duration_minutes * INTERVAL '1 minute') as end_time,
          b.duration_minutes,
          b.status,
          b.notes,
          b.created_at,
          b.updated_at,
          tl.title as listing_title,
          tl.subject,
          su.email as student_email,
          sp.first_name as student_first_name,
          sp.last_name as student_last_name
        FROM bookings b
        JOIN tutor_listings tl ON b.listing_id = tl.listing_id
        JOIN users su ON b.student_id = su.user_id
        LEFT JOIN profiles sp ON b.student_id = sp.user_id
        WHERE b.tutor_id = $1
      `;
      params = [userId];
    } else {
      throw new Error('Invalid role');
    }

    // Add status filter if provided
    if (status) {
      query += ` AND b.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ' ORDER BY b.session_date ASC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error in getBookings:', error);
    throw error;
  }
}

/**
 * Create a new booking
 * @param {number} studentId - The student's user ID
 * @param {number} listingId - The listing ID
 * @param {Date} startTime - Session start time
 * @param {Date} endTime - Session end time
 * @param {string} note - Optional notes
 */
async function createBooking(studentId, listingId, startTime, endTime, note) {
  try {
    // First, get the tutor_id from the listing
    const listingQuery = 'SELECT tutor_id FROM tutor_listings WHERE listing_id = $1';
    const listingResult = await pool.query(listingQuery, [listingId]);
    
    if (listingResult.rows.length === 0) {
      throw new Error('Listing not found');
    }
    
    const tutorId = listingResult.rows[0].tutor_id;
    
    // Calculate duration in minutes
    const durationMs = new Date(endTime) - new Date(startTime);
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    // Insert the booking
    const insertQuery = `
      INSERT INTO bookings (student_id, listing_id, tutor_id, session_date, duration_minutes, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        booking_id as id,
        booking_id,
        listing_id,
        student_id,
        tutor_id,
        session_date as start_time,
  session_date + (duration_minutes * INTERVAL '1 minute') as end_time,
        duration_minutes,
        status,
        notes,
        created_at,
        updated_at
    `;
    
    const result = await pool.query(insertQuery, [
      studentId,
      listingId,
      tutorId,
      startTime,
      durationMinutes,
      'PENDING',
      note || null
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in createBooking:', error);
    throw error;
  }
}

/**
 * Accept a booking (tutor only)
 * @param {number} bookingId - The booking ID
 * @param {number} tutorId - The tutor's user ID
 */
async function acceptBooking(bookingId, tutorId) {
  try {
    // Update the booking status to 'confirmed'
    const query = `
      UPDATE bookings
      SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
      WHERE booking_id = $1 AND tutor_id = $2 AND status = 'PENDING'
      RETURNING 
        booking_id as id,
        booking_id,
        listing_id,
        student_id,
        tutor_id,
        session_date as start_time,
  session_date + (duration_minutes * INTERVAL '1 minute') as end_time,
        duration_minutes,
        status,
        notes,
        created_at,
        updated_at
    `;
    
    const result = await pool.query(query, [bookingId, tutorId]);
    
    if (result.rows.length === 0) {
      throw new Error('Booking not found or already processed');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in acceptBooking:', error);
    throw error;
  }
}

/**
 * Get a single booking by ID
 * @param {number} bookingId - The booking ID
 */
async function getBookingById(bookingId) {
  try {
    const query = `
      SELECT 
        b.booking_id as id,
        b.booking_id,
        b.listing_id,
        b.student_id,
        b.tutor_id,
        b.session_date as start_time,
  b.session_date + (b.duration_minutes * INTERVAL '1 minute') as end_time,
        b.duration_minutes,
        b.status,
        b.notes,
        b.created_at,
        b.updated_at,
        tl.title as listing_title,
        tl.subject
      FROM bookings b
      JOIN tutor_listings tl ON b.listing_id = tl.listing_id
      WHERE b.booking_id = $1
    `;
    
    const result = await pool.query(query, [bookingId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in getBookingById:', error);
    throw error;
  }
}

module.exports = {
  getBookings,
  createBooking,
  acceptBooking,
  getBookingById
};
