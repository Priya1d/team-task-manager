// Import mongoose (used to connect MongoDB)
const mongoose = require('mongoose');

// Function to connect database
const connectDB = async () => {
  try {
    // Connect using your MongoDB Atlas URL
    // This URL comes from your .env file
    await mongoose.connect(process.env.MONGO_URI);

    // If connection is successful
    console.log('MongoDB Connected');
  } catch (err) {
    // If connection fails
    console.error('MongoDB connection failed:', err.message);

    // Stop server if DB fails (important for production)
    process.exit(1);
  }
};

// Export function so server.js can use it
module.exports = connectDB;