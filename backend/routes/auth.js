const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // <--- 1. Import JWT

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({ name, email, password });
    const savedUser = await newUser.save();
    
    // 2. Generate Token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET || "secret123");
    
    // 3. Send Token AND User
    res.json({ token, user: savedUser }); 

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.password !== password) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 2. Generate Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret123");

    // 3. Send Token AND User
    res.json({ token, user }); 

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;