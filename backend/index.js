// backend/index.js
require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/db/connection');

const PORT = process.env.PORT || 4000;

let server;

// Test database connection and schema before starting server
async function testConnection() {
    try {
        // Test basic connection
        const timeRes = await pool.query('SELECT NOW()');
        console.log('✅ Database connected at:', timeRes.rows[0].now);
        
        // Test users table
        const usersRes = await pool.query('SELECT COUNT(*) FROM users');
        console.log('✅ Users table accessible, count:', usersRes.rows[0].count);
        
        return true;
    } catch (err) {
        console.error('❌ Database connection/schema test failed:', {
            error: err.message,
            code: err.code,
            detail: err.detail
        });
        return false;
    }
}

// Start server only if database is ready
testConnection().then((ready) => {
    if (!ready) {
        console.error('❌ Failed to verify database. Exiting...');
        process.exit(1);
    }

    server = app.listen(PORT, () => {
        console.log(`🚀 API running on http://localhost:${PORT}`);
    });
});

// Graceful shutdown handlers
const shutdown = (signal) => {
    console.log(`\n${signal} received. Closing server gracefully...`);
    
    if (server) {
        server.close(() => {
            console.log('✅ Server closed');
            pool.end(() => {
                console.log('✅ Database pool closed');
                process.exit(0);
            });
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
            console.error('⚠️  Forcing shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
