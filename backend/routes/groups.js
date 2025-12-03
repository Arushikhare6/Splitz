const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');

// 1. Get all users (so you can select them when making a group)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. Create the Group
router.post('/create', async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || members.length === 0) {
      return res.status(400).json({ msg: "Please enter a name and select members" });
    }

    const newGroup = new Group({
      name,
      members
    });

    const savedGroup = await newGroup.save();
    res.json(savedGroup);
    
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// CRITICAL LINE: This exports the route so index.js can use it
module.exports = router;