const svc = require('./service');

const hasText = s => typeof s === 'string' && s.trim().length > 0;
const isPos = n => !isNaN(Number(n)) && Number(n) > 0;

async function create(req, res, next) {
    try {
        const b = req.body || {};
        if (!hasText(b.title) || !hasText(b.subject) || !isPos(b.hourly_rate)) {
            return res.status(400).json({ error: 'title, subject, hourly_rate are required (hourly_rate > 0)' });
        }
        const tutorId = req.user?.userId;
        if (!tutorId) return res.status(401).json({ error: 'Unauthorized' });

        const row = await svc.createListing(tutorId, b);
        return res.status(201).json(row);
    } catch (e) { next(e); }
}

async function search(req, res, next) {
    try {
        const q = req.query?.query || '';
        const rows = await svc.searchListings(q);
        return res.json(rows);
    } catch (e) { next(e); }
}

module.exports = { create, search };