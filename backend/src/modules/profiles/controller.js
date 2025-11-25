const svc = require('./service');

async function getMyProfile(req, res, next) {
    try {
        const userId = req.user.userId;
        const profile = await svc.getProfileByUserId(userId);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        next(err);
    }
}

async function updateMyProfile(req, res, next) {
    try {
        const userId = req.user.userId;
        const {
            firstName,
            lastName,
            university,
            major,
            year,
            bio,
            avatarUrl,
        } = req.body || {};

        if (bio && bio.length > 1000) {
            return res.status(400).json({ error: 'Bio is too long' });
        }

        await svc.upsertProfileForUser(userId, {
            firstName,
            lastName,
            university,
            major,
            year,
            bio,
            avatarUrl,
        });

        const full = await svc.getProfileByUserId(userId);
        res.json(full);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    // existing exports like getProfileById...
    getMyProfile,
    updateMyProfile,
};