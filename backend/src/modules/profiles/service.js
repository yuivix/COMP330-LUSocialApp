const pool = require('../../db/connection');

async function getProfileById(userId) {
    const sql = `
    SELECT
      p.user_id           AS "userId",
      p.first_name        AS "firstName",
      p.last_name         AS "lastName",
      p.university        AS "university",
      p.major             AS "major",
      p.year              AS "year",
      p.bio               AS "bio",
      COALESCE(p.avatar_url, p.profile_picture_url) AS "avatarUrl",
      u.email             AS "email",
      u.role              AS "role",
      u.is_verified       AS "verified"
    FROM profiles p
    JOIN users u ON u.user_id = p.user_id
    WHERE p.user_id = $1
    LIMIT 1;
  `;
    const r = await pool.query(sql, [userId]);
    return r.rows[0] || null;
}

module.exports = { getProfileById };
