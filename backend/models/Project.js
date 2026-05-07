const mongoose = require('mongoose');

// Define Project Schema
const projectSchema = new mongoose.Schema({
  // Project name
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  
  // Project description
  description: {
    type: String,
    trim: true
  },
  
  // Who created this project (admin)
  admin: {
    type: mongoose.Schema.Types.ObjectId,  // References another document
    ref: 'User',                           // References the User model
    required: true
  },
  
  // Array of team members
  members: [{
    // Each member is an object
    user: {
      type: mongoose.Schema.Types.ObjectId,  // Reference to User
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],  // Can only be 'admin' or 'member'
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now  // Automatically sets to current date/time
    }
  }]
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Export the model
module.exports = mongoose.model('Project', projectSchema); 