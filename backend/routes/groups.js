const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware'); // <--- 1. Using the Auth Guard

// 1. GET USER'S GROUPS (To show on Dashboard for sharing)
router.get('/mygroups', auth, async (req, res) => {
  try {
    // Find groups where the 'members' array includes the logged-in user's ID
    const groups = await Group.find({ members: req.user.id });
    res.json(groups);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET ALL USERS (For the create group checklist)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. CREATE GROUP (Updated to auto-add the creator)
router.post('/create', auth, async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || members.length === 0) {
      return res.status(400).json({ msg: "Please enter a name and select members" });
    }

    // Auto-add the creator (req.user.id) to the members list
    // 'Set' ensures no duplicate IDs
    const allMembers = [...new Set([...members, req.user.id])];

    const newGroup = new Group({
      name,
      members: allMembers
    });

    const savedGroup = await newGroup.save();
    res.json(savedGroup);
    
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 4. JOIN GROUP VIA LINK (New Feature)
router.post('/join/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    // Check if user is already a member
    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ msg: "You are already in this group" });
    }

    // Add User to Group
    group.members.push(req.user.id);
    await group.save();

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;