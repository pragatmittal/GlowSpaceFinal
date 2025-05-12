const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Controllers (to be implemented)
const moodController = require('../controllers/mood.controller');

// Get all moods for the logged-in user
router.get('/', protect, moodController.getAllMoods);

// Get mood by date
router.get('/:date', protect, moodController.getMoodByDate);

// Add today's mood
router.post('/', protect, moodController.addMood);

// Edit mood by date
router.put('/:date', protect, moodController.editMood);

module.exports = router; 