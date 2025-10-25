// backend/index.js
require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/db/connection');

const PORT = process.env.PORT || 4000;

// Test database connection before starting server
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Database connected at:', res.rows[0].now);

    app.listen(PORT, () => {
        console.log(`🚀 API running on http://localhost:${PORT}`);
    });
});
