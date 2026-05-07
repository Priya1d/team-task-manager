const mongoose = require('mongoose');

// Define Task Schema
const taskSchema = new mongoose.Schema({
  // Which project does this task belong to
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // Task title
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  
  // Task description
  description: {
    type: String,
    trim: true
  },
  
  // Who is assigned to this task
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Task status
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'done'],  // Only these 3 values allowed
    default: 'todo'                         // New tasks start as 'todo'
  },
  
  // Task priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],  // Only these 3 values allowed
    default: 'medium'                 // Default is 'medium'
  },
  
  // Due date
  dueDate: {
    type: Date  // Stores date and time
  },
  
  // Who created this task
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Export the model
module.exports = mongoose.model('Task', taskSchema);