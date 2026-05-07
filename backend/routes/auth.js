// Import required packages
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public (anyone can access)
router.post('/signup', async (req, res) => {
  try {
    // Step 1: Get data from request body
    const { name, email, password } = req.body;

    // Step 2: Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Step 3: Create new user
    user = new User({
      name,
      email,
      password  // Will be hashed automatically by the model
    });

    // Step 4: Save user to database
    await user.save();

    // Step 5: Generate JWT token
    const token = jwt.sign(
      { userId: user._id },           // Payload (data inside token)
      process.env.JWT_SECRET,         // Secret key
      { expiresIn: '7d' }             // Token expires in 7 days
    );

    // Step 6: Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Step 1: Get credentials from request
    const { email, password } = req.body;

    // Step 2: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Step 3: Check password using our custom method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Step 4: Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Step 5: Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private (requires authentication)
router.get('/me', auth, async (req, res) => {
  // req.user is set by auth middleware
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Export router
module.exports = router; 