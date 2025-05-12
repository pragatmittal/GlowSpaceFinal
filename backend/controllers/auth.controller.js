const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/email');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Send welcome email
    const welcomeHtml = `
      <h1>Welcome to GlowSpace!</h1>
      <p>Dear ${name},</p>
      <p>Thank you for registering with GlowSpace. We're excited to have you on board!</p>
      <p>You can now login to your account and start exploring our services.</p>
      <p>Best regards,<br>The GlowSpace Team</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Welcome to GlowSpace',
      message: 'Welcome to GlowSpace!',
      html: welcomeHtml
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    try {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { name, email, sub: googleId } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        password: crypto.randomBytes(16).toString('hex')
      });

      // Send welcome email
      const welcomeHtml = `
        <h1>Welcome to GlowSpace!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for registering with GlowSpace using your Google account. We're excited to have you on board!</p>
        <p>You can now login to your account and start exploring our services.</p>
        <p>Best regards,<br>The GlowSpace Team</p>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Welcome to GlowSpace',
        message: 'Welcome to GlowSpace!',
        html: welcomeHtml
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID
      user.googleId = googleId;
      await user.save();
    }

    // Generate token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send email with reset token
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const resetHtml = `
      <h1>Password Reset Request</h1>
      <p>Dear ${user.name},</p>
      <p>You are receiving this email because you (or someone else) has requested the reset of your password.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link will expire in 10 minutes.</p>
      <p>Best regards,<br>The GlowSpace Team</p>
    `;

    const emailSent = await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: 'Password Reset Request',
      html: resetHtml
    });

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send confirmation email
    const confirmHtml = `
      <h1>Password Reset Successful</h1>
      <p>Dear ${user.name},</p>
      <p>Your password has been successfully reset.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      <p>Best regards,<br>The GlowSpace Team</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Successful',
      message: 'Password Reset Successful',
      html: confirmHtml
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Validate reset token
// @route   GET /api/auth/validate-reset-token/:token
// @access  Public
exports.validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
  } catch (err) {
    next(err);
  }
}; 