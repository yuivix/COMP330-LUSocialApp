// backend/src/db/connection.js
require('dotenv').config();
const { Pool } = require('pg');

// Decide when to use SSL (Render requires it)
const useSSL =
  (process.env.DB_SSL || '').toLowerCase() === 'true' ||
  (process.env.DATABASE_URL || '').includes('render.com') ||
  (process.env.DATABASE_URL || '').includes('sslmode=require');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:@localhost:5432/lututor'; // fallback for local dev

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helpful logs
pool.on('connect', () => {
  console.log('✅ PostgreSQL: pool connected', { ssl: !!useSSL });
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
  process.exit(-1);
});

module.exports = pool;

