const express = require('express');
const mongoose = require('mongoose');
const groupRoute = require('./routes/groups');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/groups', groupRoute);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Test Route
app.get('/', (req, res) => {
  res.send('API is Running...');
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});