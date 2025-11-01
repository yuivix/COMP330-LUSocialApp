// backend/src/modules/bookings/controller.js
const pool = require('../../db/connection');

function toDbStatus(apiStatus) {
  // Map API statuses to DB statuses
  switch (apiStatus) {
    case 'REQUESTED':
      return 'pending';
    case 'ACCEPTED':
      return 'confirmed';
    default:
      return apiStatus;
  }
}

function toApiStatus(dbStatus) {
  switch (dbStatus) {
    case 'pending':
      return 'REQUESTED';
    case 'confirmed':
      return 'ACCEPTED';
    default:
      return dbStatus.toUpperCase();
  }
}

function rowToApi(b) {
  const start = new Date(b.session_date);
  const end = new Date(start.getTime() + b.duration_minutes * 60000);
  return {
    id: b.booking_id,
    listing_id: b.listing_id,
    start_time: b.session_date,
    end_time: end,
    status: toApiStatus(b.status),
    student_id: b.student_id,
    tutor_id: b.tutor_id,
    note: b.notes || null,
  };
}

async function createBooking(req, res, next) {
  try {
    const { listing_id, start_time, end_time, note } = req.body || {};
    const studentId = req.user.userId;

    if (!listing_id || !start_time || !end_time) {
      return res.status(400).json({ error: 'listing_id, start_time, end_time are required' });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);
    if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end) || end <= start) {
      return res.status(400).json({ error: 'Invalid start_time/end_time' });
    }

    // 1) Get listing and tutor_id
    const { rows: listingRows } = await pool.query(
      'SELECT listing_id, tutor_id FROM tutor_listings WHERE listing_id = $1',
      [listing_id]
    );
    if (listingRows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    const tutorId = listingRows[0].tutor_id;

    // 2) Overlap check for this tutor against pending/confirmed
    const { rows: overlap } = await pool.query(
      `SELECT 1 FROM bookings b
       WHERE b.tutor_id = $1
         AND b.status IN ('pending','confirmed')
         AND b.session_date < $3
         AND (b.session_date + (b.duration_minutes * interval '1 minute')) > $2
       LIMIT 1`,
      [tutorId, start.toISOString(), end.toISOString()]
    );
    if (overlap.length > 0) {
      return res.status(409).json({ error: 'Requested time overlaps with an existing booking' });
    }

    // 3) Insert booking
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const { rows } = await pool.query(
      `INSERT INTO bookings (student_id, listing_id, tutor_id, session_date, duration_minutes, status, notes)
       VALUES ($1,$2,$3,$4,$5,'pending',$6)
       RETURNING *`,
      [studentId, listing_id, tutorId, start.toISOString(), durationMinutes, note || null]
    );

    const b = rowToApi(rows[0]);
    return res.status(201).json(b);
  } catch (e) {
    next(e);
  }
}

async function acceptBooking(req, res, next) {
  try {
    const id = Number(req.params.id);
    const tutorId = req.user.userId;
    if (!id) return res.status(400).json({ error: 'Invalid booking id' });

    // Ensure tutor owns this booking
    const { rows: currentRows } = await pool.query('SELECT * FROM bookings WHERE booking_id = $1', [id]);
    if (currentRows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const current = currentRows[0];
    if (current.tutor_id !== tutorId) return res.status(403).json({ error: 'You do not own this booking' });

    // Update status to confirmed
    const { rows } = await pool.query(
      `UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $1
       RETURNING *`,
      [id]
    );

    return res.json(rowToApi(rows[0]));
  } catch (e) {
    next(e);
  }
}

async function listBookings(req, res, next) {
  try {
    const userId = req.user.userId;
    const role = req.query.role || req.user.role; // optional filter
    const status = req.query.status ? toDbStatus(String(req.query.status).toUpperCase()) : null;

    let where = '';
    const params = [];
    if (role === 'tutor') {
      params.push(userId);
      where = 'b.tutor_id = $1';
    } else {
      params.push(userId);
      where = 'b.student_id = $1';
    }

    if (status) {
      params.push(status);
      where += ` AND b.status = $${params.length}`;
    }

    const { rows } = await pool.query(
      `SELECT b.* FROM bookings b
       WHERE ${where}
       ORDER BY b.session_date DESC`,
      params
    );

    const out = rows.map(rowToApi).map(b => ({
      id: b.id,
      listing_id: b.listing_id,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      other_party_id: role === 'tutor' ? b.student_id : b.tutor_id,
    }));

    res.json(out);
  } catch (e) {
    next(e);
  }
}

module.exports = { createBooking, acceptBooking, listBookings };
