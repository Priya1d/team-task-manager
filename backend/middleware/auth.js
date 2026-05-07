const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Debug: See what's being sent
    console.log('Authorization Header:', req.header('Authorization'));
    
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Debug: See extracted token
    console.log('Extracted Token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }

    // Attach user to request
    req.user = user;
    
    // Continue to next function
    next();
    
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ 
      message: 'Token is not valid' 
    });
  }
};

module.exports = auth; 