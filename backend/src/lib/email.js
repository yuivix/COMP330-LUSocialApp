// backend/src/lib/email.js

function sendEmail(to, templateId, params = {}) {
    // For this class, we only log — no real email provider
    console.log('[EMAIL]', {
        to,
        templateId,
        params,
        at: new Date().toISOString(),
    });
}

module.exports = {
    sendEmail,
};
