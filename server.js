
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leave');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB with improved error handling
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    console.log('Please check your MongoDB connection string and make sure MongoDB is running.');
    process.exit(1); // Exit with failure if cannot connect to database
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Hostel Leave Management API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
