const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');

// 1. GET MY NOTIFICATIONS
router.get('/', auth, async (req, res) => {
  try {
    // Get latest 10 notifications for the logged-in user
    // Sort by 'createdAt' descending (newest first)
    const notes = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 2. MARK AS READ
router.put('/mark-read/:id', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;