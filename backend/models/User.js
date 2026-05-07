// Import mongoose
const mongoose = require('mongoose');
// Import bcrypt for password hashing
const bcrypt = require('bcryptjs');

// Define User Schema (structure)
const userSchema = new mongoose.Schema({
  // Name field
  name: {
    type: String,                    // Must be text
    required: [true, 'Name is required'],  // Can't be empty
    trim: true                       // Removes extra spaces
  },
  
  // Email field
  email: {
    type: String,                    // Must be text
    required: [true, 'Email is required'], // Can't be empty
    unique: true,                    // No two users can have same email
    lowercase: true,                 // Converts to lowercase
    trim: true                       // Removes extra spaces
  },
  
  // Password field
  password: {
    type: String,                    // Must be text
    required: [true, 'Password is required'], // Can't be empty
    minlength: 6                     // Must be at least 6 characters
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// MIDDLEWARE: Hash password before saving to database
userSchema.pre('save', async function () {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return;
  }

  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);
});

// METHOD: Compare login password with hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the model
module.exports = mongoose.model('User', userSchema);