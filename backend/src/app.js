// backend/src/app.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/routes');
const profileRoutes = require('./modules/profiles/routes');
const listingRoutes = require('./modules/listings/routes');
const searchRoutes = require('./modules/search/routes');
const bookingRoutes = require('./modules/bookings/routes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check (used by FE to confirm BE is alive)
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Mount module routers (stubs for now)
app.use('/auth', authRoutes);
app.use('/profiles', profileRoutes);
app.use('/listings', listingRoutes);
app.use('/search', searchRoutes);
app.use('/bookings', bookingRoutes);

// Basic 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// ADD THIS LINE - Error handler (must be last)
app.use(require('./middleware/errorHandler'));


module.exports = app;