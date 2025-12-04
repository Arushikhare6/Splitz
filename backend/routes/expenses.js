const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const Group = require('../models/Group');
const auth = require('../middleware/authMiddleware'); 

// 1. GET USERS (Protected)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find(); 
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET GROUPS (Protected)
router.get('/groups', auth, async (req, res) => {
  try {
    const groups = await Group.find(); 
    res.json(groups);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. ADD EXPENSE (Protected + Auto-Split Logic)
router.post('/add', auth, async (req, res) => {
  try {
    // Added 'category' to destructuring
    const { description, amount, paidBy, group, category } = req.body;

    // 1. Fetch group to find members
    const groupData = await Group.findById(group);
    if (!groupData) return res.status(404).json({ msg: "Group not found" });

    // 2. Calculate Equal Split
    const splitAmount = amount / groupData.members.length;

    // 3. Create "Who Owes Whom" array
    const splitDetails = groupData.members.map(memberId => ({
      user: memberId,
      // If you paid, you owe 0. If someone else paid, they owe the split amount.
      amountOwed: memberId.toString() === paidBy ? 0 : splitAmount 
    }));

    const newExpense = new Expense({
      description,
      amount,
      paidBy,
      group,
      category: category || 'Other', // Save the Category
      splitDetails: splitDetails     // Save the calculated split
    });

    const savedExpense = await newExpense.save();
    res.status(200).json(savedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 4. LIST EXPENSES (Protected)
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find().populate('paidBy', 'name');
    res.json(expenses);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;