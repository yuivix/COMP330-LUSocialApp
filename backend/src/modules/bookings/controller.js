const svc = require('./service');

async function createBooking(req, res, next) {
    try {
        const { listing_id, start_time, end_time, note } = req.body;
        const userId = req.user?.userId; // assume JWT middleware
        if (!listing_id || !start_time || !end_time) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const booking = await svc.createBooking(userId, listing_id, start_time, end_time, note);
        res.status(201).json(booking);
    } catch (err) {
        if (err.code === '409') {
            return res.status(409).json({ message: 'Tutor not available' });
        }
        next(err);
    }
}

async function getBookingsByRole(req, res, next) {
    try {
        const { role } = req.query;
        const userId = req.user?.userId;
        const bookings = await svc.getBookingsByRole(userId, role);
        res.json(bookings);
    } catch (err) {
        next(err);
    }
}

// Accept booking
async function acceptBooking(req, res) {
    try {
        const { id } = req.params;
        const tutorId = req.user.userId; // From JWT token

        const booking = await service.acceptBooking(id, tutorId);
        res.json(booking);
    } catch (error) {
        if (error.code === '404') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === '403') {
            return res.status(403).json({ error: error.message });
        }
        console.error('Accept booking error:', error);
        res.status(500).json({ error: 'Failed to accept booking' });
    }
}

module.exports = { createBooking, getBookingsByRole, acceptBooking };