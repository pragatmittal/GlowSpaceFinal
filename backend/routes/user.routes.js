const express = require('express');
const router = express.Router();
const User = require('../models/User.model');

router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.query.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.query.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, email } = req.body;
    
    if (username || email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.query.id } },
          { $or: [
            username ? { username: username } : { _id: null },
            email ? { email: email } : { _id: null }
          ]}
        ]
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username or email already in use'
        });
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;