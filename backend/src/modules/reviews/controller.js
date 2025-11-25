// backend/src/modules/reviews/controller.js
const svc = require('./service');

// GET /reviews?tutorId=...&page=...&pageSize=...
async function listForTutor(req, res, next) {
    try {
        const tutorId = Number(req.query.tutorId);
        const page = Math.max(1, Number(req.query.page || 1));
        const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));

        if (!Number.isInteger(tutorId) || tutorId <= 0) {
            return res.status(400).json({ error: 'tutorId (number) is required' });
        }

        const { averageRating, total, reviews } = await svc.getReviewsForTutor({
            tutorId,
            page,
            pageSize,
        });

        return res.json({
            tutorId,
            averageRating,  // number | null
            total,          // total number of reviews for this tutor
            page,
            pageSize,
            reviews,        // [{ rating, comment, createdAt, reviewer: { firstName, lastName } }]
        });
    } catch (err) {
        next(err);
    }
}

// POST /reviews
async function createReview(req, res, next) {
    try {
        const { bookingId, rating, comment } = req.body || {};
        const reviewerId = req.user.userId;

        if (!bookingId || !rating) {
            return res.status(400).json({ error: 'bookingId and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const review = await svc.createReview({
            bookingId,
            reviewerId,
            rating,
            comment: comment || '',
        });

        res.status(201).json(review);
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ error: err.message || 'Failed to create review' });
    }
}

module.exports = {
    listForTutor,
    createReview,
};
