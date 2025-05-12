const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

const analyticsController = require('../controllers/analytics.controller');

// Mood stats summary
router.get('/summary', protect, analyticsController.getSummary);

module.exports = router; 