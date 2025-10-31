const pool = require('../../db/connection');

async function createUser(email, passwordHash, role, verificationToken) {
    const q = `
    INSERT INTO users (email, password_hash, role, verification_token, is_verified)
    VALUES ($1, $2, $3, $4, false)
    RETURNING user_id, email, role, is_verified
  `;
    const { rows } = await pool.query(q, [email, passwordHash, role, verificationToken]);
    const user = rows[0];

    await pool.query(
        `INSERT INTO profiles (user_id, created_at, updated_at)
     VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO NOTHING`,
        [user.user_id]
    );

    return user;
}

async function findUserByEmail(email) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return rows[0];
}

async function verifyUserByToken(token) {
    const q = `
    UPDATE users
       SET is_verified = true,
           verification_token = NULL,
           updated_at = CURRENT_TIMESTAMP
     WHERE verification_token = $1
     RETURNING user_id, email, role, is_verified
  `;
    const { rows } = await pool.query(q, [token]);
    return rows[0];
}

module.exports = { createUser, findUserByEmail, verifyUserByToken };