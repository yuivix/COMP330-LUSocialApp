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

module.exports = { getReviewsForTutor };
