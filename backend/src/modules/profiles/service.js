// backend/src/modules/profiles/service.js
const pool = require('../../db/connection');

/**
 * Shared SELECT for a user+profile by userId.
 * Used by both /profiles/:userId and /profiles/me
 */
async function getProfileByUserId(userId) {
  const { rows } = await pool.query(
    `
    SELECT
      u.user_id      AS "userId",
      u.email        AS "email",
      u.role         AS "role",
      u.is_verified  AS "verified",
      p.first_name   AS "firstName",
      p.last_name    AS "lastName",
      p.university   AS "university",
      p.major        AS "major",
      p.year         AS "year",
      p.bio          AS "bio",
      p.avatar_url   AS "avatarUrl"
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.user_id
    WHERE u.user_id = $1
    `,
    [userId]
  );

  return rows[0] || null;
}

/**
 * For /profiles/:userId – controller calls svc.getProfileById(...)
 * Just reuses the same query.
 */
async function getProfileById(userId) {
  return getProfileByUserId(userId);
}

/**
 * Upsert profile row for a given user.
 * Used by /profiles/me PATCH.
 */
async function upsertProfileForUser(userId, fields) {
  const {
    firstName = null,
    lastName = null,
    university = null,
    major = null,
    year = null,
    bio = null,
    avatarUrl = null,
  } = fields || {};

  const { rows } = await pool.query(
    `
    INSERT INTO profiles (
      user_id, first_name, last_name, university, major, year, bio, avatar_url, updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name  = EXCLUDED.last_name,
      university = EXCLUDED.university,
      major      = EXCLUDED.major,
      year       = EXCLUDED.year,
      bio        = EXCLUDED.bio,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW()
    RETURNING user_id
    `,
    [userId, firstName, lastName, university, major, year, bio, avatarUrl]
  );

  return rows[0];
}

/**
 * Wrapper used by controller.updateMyProfile – returns full profile shape
 */
async function updateProfileForUser(userId, fields) {
  await upsertProfileForUser(userId, fields);
  // Return the full joined profile so FE gets fresh data
  return getProfileByUserId(userId);
}

module.exports = {
  getProfileByUserId,
  getProfileById,
  upsertProfileForUser,
  updateProfileForUser,
  // keep any other exports you already had here
};
