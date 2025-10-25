// backend/src/utils/validators.js

// Validate .edu email
function isEduEmail(email) {
    return /^[^\s@]+@[^\s@]+\.edu$/.test(email);
}

// Validate password strength
function isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password);
}

// Sanitize user input
function sanitizeInput(input) {
    return input.trim();
}

module.exports = {
    isEduEmail,
    isStrongPassword,
    sanitizeInput
};