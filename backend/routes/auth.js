const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // <--- 1. Import bcrypt for security

// CONSTANT SECRET (Matches your middleware)
const JWT_SECRET = "rasayans_secret_key_123";

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    // 2. Hash the password (Security step)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User with Hashed Password
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });

    const savedUser = await newUser.save();
    
    // 4. Generate Token
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET);
    
    // 5. Send Response
    res.json({ token, user: { id: savedUser._id, name: savedUser.name, email: savedUser.email } }); 

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // 2. Check Password
    // A. Try comparing with Bcrypt (for new users)
    const isMatch = await bcrypt.compare(password, user.password);

    // B. Fallback: Check plain text (for Auto-Seeded users like "Arushi" who have password "123")
    if (!isMatch && password !== user.password) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 3. Generate Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    // 4. Send Response
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } }); 

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const jwt = require('jsonwebtoken'); // <--- 1. Import JWT

// // REGISTER
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
    
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ msg: "User already exists" });

//     const newUser = new User({ name, email, password });
//     const savedUser = await newUser.save();
    
//     // 2. Generate Token
//     const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET || "secret123");
    
//     // 3. Send Token AND User
//     res.json({ token, user: savedUser }); 

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // LOGIN
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "User not found" });

//     if (user.password !== password) {
//       return res.status(400).json({ msg: "Invalid credentials" });
//     }

//     // 2. Generate Token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret123");

//     // 3. Send Token AND User
//     res.json({ token, user }); 

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;