const pool = require('../../db/connection');

async function createUser(email, passwordHash, role, verificationToken) {
    try {
        // First check if the user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            const error = new Error('Email already registered');
            error.code = '23505';
            throw error;
        }

        // Simple insert into users table
        const q = `
        INSERT INTO users (
            email, 
            password_hash, 
            role, 
            verification_token, 
            is_verified,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING user_id, email, role, is_verified
        `;

        const { rows } = await pool.query(q, [email, passwordHash, role, verificationToken]);
        console.log('User created successfully:', rows[0]);
        return rows[0];
    } catch (error) {
        console.error('Error creating user:', {
            message: error.message,
            code: error.code,
            detail: error.detail
        });
        throw error;
    }
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