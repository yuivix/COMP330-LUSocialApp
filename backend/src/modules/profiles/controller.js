// backend/src/modules/profiles/controller.js
const svc = require('./service');

/**
 * PUBLIC PROFILE - GET /profiles/:userId
 */
async function getProfileById(req, res, next) {
    try {
        const { userId } = req.params;

        if (!/^\d+$/.test(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const profile = await svc.getProfileById(Number(userId));

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        next(err);
    }
}


/**
 * MY PROFILE - GET /profiles/me
 */
async function getMyProfile(req, res, next) {
    try {
        const userId = req.user.userId;
        const profile = await svc.getProfileByUserId(userId);

        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.json(profile);
    } catch (err) {
        next(err);
    }
}


/**
 * MY PROFILE UPDATE - PATCH /profiles/me
 */
async function updateMyProfile(req, res, next) {
    try {
        const userId = req.user.userId;

        const updated = await svc.updateProfileForUser(userId, req.body);

        res.json(updated);
    } catch (err) {
        next(err);
    }
}


/**
 * EXPORT ALL CONTROLLERS
 */
module.exports = {
    getProfileById,
    getMyProfile,
    updateMyProfile,
};
