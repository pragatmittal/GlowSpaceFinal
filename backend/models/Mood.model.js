const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moodType: {
    type: String,
    required: true
  },
  emojiURL: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true,
    unique: true // One mood per date per user
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mood', moodSchema); 