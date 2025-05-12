const Mood = require('../models/Mood.model');
const mongoose = require('mongoose');

// Get all moods for the logged-in user
exports.getAllMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
};

// Get mood by date (YYYY-MM-DD)
exports.getMoodByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    if (isNaN(date)) return res.status(400).json({ error: 'Invalid date' });
    const start = new Date(date.setHours(0,0,0,0));
    const end = new Date(date.setHours(23,59,59,999));
    const mood = await Mood.findOne({ userId: req.user._id, date: { $gte: start, $lte: end } });
    if (!mood) return res.status(404).json({ error: 'Mood not found for this date' });
    res.json(mood);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mood' });
  }
};

// Add today's mood
exports.addMood = async (req, res) => {
  try {
    const { moodType, emojiURL, notes, date } = req.body;
    if (!moodType || !emojiURL) return res.status(400).json({ error: 'Mood type and emojiURL are required' });
    const moodDate = date ? new Date(date) : new Date();
    const start = new Date(moodDate.setHours(0,0,0,0));
    const end = new Date(moodDate.setHours(23,59,59,999));
    // Only one mood per date per user
    const existing = await Mood.findOne({ userId: req.user._id, date: { $gte: start, $lte: end } });
    if (existing) return res.status(409).json({ error: 'Mood already exists for this date' });
    const mood = new Mood({
      userId: req.user._id,
      moodType,
      emojiURL,
      notes: notes || '',
      date: start
    });
    await mood.save();
    res.status(201).json(mood);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add mood' });
  }
};

// Edit mood by date
exports.editMood = async (req, res) => {
  try {
    const { moodType, emojiURL, notes } = req.body;
    const date = new Date(req.params.date);
    if (isNaN(date)) return res.status(400).json({ error: 'Invalid date' });
    const start = new Date(date.setHours(0,0,0,0));
    const end = new Date(date.setHours(23,59,59,999));
    const mood = await Mood.findOne({ userId: req.user._id, date: { $gte: start, $lte: end } });
    if (!mood) return res.status(404).json({ error: 'Mood not found for this date' });
    if (moodType) mood.moodType = moodType;
    if (emojiURL) mood.emojiURL = emojiURL;
    if (notes !== undefined) mood.notes = notes;
    await mood.save();
    res.json(mood);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit mood' });
  }
}; 