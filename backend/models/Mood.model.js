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
  }
}, {
  timestamps: true
});

// Add compound index for userId + date
moodSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Mood', moodSchema); 