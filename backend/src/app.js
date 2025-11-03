// backend/src/app.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/routes');
const profileRoutes = require('./modules/profiles/routes');
const listingRoutes = require('./modules/listings/routes');
const searchRoutes = require('./modules/search/routes');
const bookingRoutes = require('./modules/bookings/routes');

const app = express();

app.use(cors({
    origin: [
        'https://lututor-app.vercel.app',
        'https://lu-tutor-app.vercel.app',
        'https://lututor-app.vercel.app',  // in case there's a typo in the URL
        'http://localhost:3000',
        'http://localhost:5173'  // in case you're using Vite
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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