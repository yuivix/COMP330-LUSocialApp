const pool = require('../../db/connection');

async function getReviewsForTutor({ tutorId, page, pageSize }) {
  const offset = (page - 1) * pageSize;

  // Aggregate (average + total)
  const aggSql = `
    SELECT
      ROUND(AVG(rating)::numeric, 1) AS average_rating,
      COUNT(*)::int                 AS total
    FROM reviews
    WHERE reviewee_id = $1
  `;
  const agg = await pool.query(aggSql, [tutorId]);
  const averageRating = agg.rows[0].average_rating; // can be null if no rows
  const total = agg.rows[0].total;

  // Page of reviews (with reviewer name)
  const pageSql = `
    SELECT
      r.rating                    AS "rating",
      r.comment                   AS "comment",
      r.created_at                AS "createdAt",
      COALESCE(p.first_name, '')  AS "firstName",
      COALESCE(p.last_name,  '')  AS "lastName"
    FROM reviews r
    LEFT JOIN profiles p ON p.user_id = r.reviewer_id
    WHERE r.reviewee_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const list = await pool.query(pageSql, [tutorId, pageSize, offset]);

  const reviews = list.rows.map(row => ({
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt,
    reviewer: {
      firstName: row.firstName,
      lastName: row.lastName
    }
  }));

  return { averageRating, total, reviews };
}

async function createReview({ bookingId, reviewerId, rating, comment }) {
  // 1. Get booking
  const { rows: bookingRows } = await pool.query(
    `SELECT booking_id, student_id, tutor_id, status
     FROM bookings
     WHERE booking_id = $1`,
    [bookingId]
  );
  const booking = bookingRows[0];

  if (!booking) {
    const err = new Error('Booking not found');
    err.status = 404;
    throw err;
  }

  // 2. Only student can review
  if (booking.student_id !== reviewerId) {
    const err = new Error('Only the student can review this booking');
    err.status = 403;
    throw err;
  }

  // 3. Must be completed
  if (booking.status !== 'COMPLETED') {
    const err = new Error('Booking must be completed before review');
    err.status = 400;
    throw err;
  }

  // 4. Prevent duplicates
  const { rows: existing } = await pool.query(
    `SELECT review_id FROM reviews WHERE booking_id = $1`,
    [bookingId]
  );
  if (existing.length) {
    const err = new Error('Review already exists for this booking');
    err.status = 409;
    throw err;
  }

  // 5. Insert review
  const { rows: reviewRows } = await pool.query(
    `INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING review_id, rating, comment, created_at`,
    [bookingId, reviewerId, booking.tutor_id, rating, comment]
  );

  return {
    bookingId,
    tutorId: booking.tutor_id,
    ...reviewRows[0],
  };
}


module.exports = { getReviewsForTutor, createReview };
