// Analytics Controller (stub)
const Mood = require('../models/Mood.model');

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const moods = await Mood.find({ userId });

    // Pie chart: mood distribution
    const moodDistribution = moods.reduce((acc, mood) => {
      acc[mood.moodType] = (acc[mood.moodType] || 0) + 1;
      return acc;
    }, {});

    // Bar chart: weekly mood count (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);
    const weeklyCounts = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAgo);
      d.setDate(weekAgo.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      weeklyCounts[key] = 0;
    }
    moods.forEach(mood => {
      const dateKey = mood.date.toISOString().slice(0, 10);
      if (weeklyCounts[dateKey] !== undefined) {
        weeklyCounts[dateKey]++;
      }
    });

    // Line chart: monthly mood pattern (current month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthlyPattern = {};
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i);
      const key = d.toISOString().slice(0, 10);
      monthlyPattern[key] = 0;
    }
    moods.forEach(mood => {
      const dateKey = mood.date.toISOString().slice(0, 10);
      if (monthlyPattern[dateKey] !== undefined) {
        monthlyPattern[dateKey]++;
      }
    });

    res.json({
      moodDistribution,
      weeklyCounts,
      monthlyPattern
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}; 