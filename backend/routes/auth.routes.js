const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  validateResetToken
} = require('../controllers/auth.controller');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Google OAuth route
router.post('/google', googleLogin);

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Validate reset token route
router.get('/validate-reset-token/:token', validateResetToken);

// Reset password route
router.post('/reset-password', resetPassword);

module.exports = router; 