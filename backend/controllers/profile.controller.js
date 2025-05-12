const User = require('../models/User.model');

// Profile Controller (stub)
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { darkMode, notificationOptIn } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (darkMode !== undefined) user.preferences.darkMode = darkMode;
    if (notificationOptIn !== undefined) user.preferences.notificationOptIn = notificationOptIn;
    await user.save();
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
}; 