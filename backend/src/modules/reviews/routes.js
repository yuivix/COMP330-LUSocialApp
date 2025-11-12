const express = require('express');
const router = express.Router();
const ctrl = require('./controller');

// GET /reviews?tutorId=123&page=1&pageSize=10
router.get('/', ctrl.listForTutor);

module.exports = router;
