const svc = require('./service');

exports.getProfileById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!/^\d+$/.test(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }
        const profile = await svc.getProfileById(Number(userId));
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        next(err);
    }
};
