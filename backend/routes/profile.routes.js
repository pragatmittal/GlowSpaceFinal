const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

const profileController = require('../controllers/profile.controller');

// Get preferences
router.get('/preferences', protect, profileController.getPreferences);

// Update preferences
router.put('/preferences', protect, profileController.updatePreferences);

module.exports = router; 