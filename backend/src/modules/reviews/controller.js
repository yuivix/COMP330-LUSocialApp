const svc = require('./service');

exports.listForTutor = async (req, res, next) => {
    try {
        const tutorId = Number(req.query.tutorId);
        const page = Math.max(1, Number(req.query.page || 1));
        const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));

        if (!Number.isInteger(tutorId) || tutorId <= 0) {
            return res.status(400).json({ error: 'tutorId (number) is required' });
        }

        const { averageRating, total, reviews } = await svc.getReviewsForTutor({
            tutorId, page, pageSize
        });

        return res.json({
            tutorId,
            averageRating,   // number | null
            total,           // total number of reviews for this tutor
            page,
            pageSize,
            reviews          // [{ rating, comment, createdAt, reviewer: { firstName, lastName } }]
        });
    } catch (err) {
        next(err);
    }
};
