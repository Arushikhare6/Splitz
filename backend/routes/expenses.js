const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const Group = require('../models/Group');

// 1. GET USERS (For the "Who Paid" dropdown)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET GROUPS (For the "Group" dropdown)
router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find(); // Fetch all groups
    res.json(groups);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. ADD EXPENSE (Saves the selection)
router.post('/add', async (req, res) => {
  try {
    const { description, amount, paidBy, group } = req.body;

    const newExpense = new Expense({
      description,
      amount,
      paidBy,
      group,
      splitDetails: [] 
    });

    const savedExpense = await newExpense.save();
    res.status(200).json(savedExpense);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. LIST EXPENSES
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().populate('paidBy', 'name');
    res.json(expenses);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;