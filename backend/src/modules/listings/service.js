const pool = require('../../db/connection');

async function createListing(tutorId, data) {
    const sql = `
    INSERT INTO tutor_listings
      (tutor_id, title, subject, course_code, hourly_rate, description, location, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    RETURNING listing_id, tutor_id, title, subject, course_code, hourly_rate, description, location, created_at, updated_at
  `;
    const vals = [
        tutorId,
        String(data.title).trim(),
        String(data.subject).trim(),
        data.course_code || null,
        Number(data.hourly_rate),
        data.description || null,
        data.location || null,
    ];
    const { rows } = await pool.query(sql, vals);
    return rows[0];
}

async function searchListings(queryText) {
    const base = `
    SELECT listing_id, tutor_id, title, subject, course_code, hourly_rate, description, location, updated_at
    FROM tutor_listings
    WHERE is_active = true
  `;
    if (!queryText || !String(queryText).trim()) {
        const sql = `${base} ORDER BY updated_at DESC LIMIT 25`;
        return (await pool.query(sql)).rows;
    }
    const like = `%${String(queryText).trim()}%`;
    const sql = `
    ${base}
      AND (
        title ILIKE $1 OR subject ILIKE $1 OR description ILIKE $1 OR location ILIKE $1
      )
    ORDER BY updated_at DESC
    LIMIT 25
  `;
    const { rows } = await pool.query(sql, [like]);
    return rows;
}

module.exports = { createListing, searchListings };