const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const Group = require('../models/Group');
const auth = require('../middleware/authMiddleware'); 
const Notification = require('../models/Notification'); 

// 1. GET ALL USERS (Protected)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET ALL GROUPS (Protected + Populated)
router.get('/groups', auth, async (req, res) => {
  try {
    const groups = await Group.find().populate('members', 'name');
    res.json(groups);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. GET EXPENSES FOR A SPECIFIC GROUP
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId }).populate('paidBy', 'name');
    res.json(expenses);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. ADD EXPENSE (With Name Fix)
router.post('/add', auth, async (req, res) => {
  try {
    const { description, amount, paidBy, group, category } = req.body;

    // 1. Fetch group
    const groupData = await Group.findById(group);
    if (!groupData) return res.status(404).json({ message: "Group not found" });

    // 2. Calculate Equal Split
    const splitAmount = amount / groupData.members.length;

    // 3. Create Split Details
    const splitDetails = groupData.members.map(memberId => ({
      user: memberId,
      amountOwed: memberId.toString() === paidBy ? 0 : splitAmount
    }));

    const newExpense = new Expense({
      description,
      amount,
      paidBy,
      group,
      category: category || 'Other',
      splitDetails,      
      date: new Date()   
    });

    const savedExpense = await newExpense.save();

    // ---------------------------------------------------------
    // 🔔 NOTIFICATION LOGIC (FIXED NAME ISSUE)
    // ---------------------------------------------------------
    
    // Fetch the Payer's Name from DB so we don't say "a friend"
    const payerUser = await User.findById(paidBy);
    const payerName = payerUser ? payerUser.name : 'a friend';

    const notifications = splitDetails
      .filter(split => split.amountOwed > 0 && split.user.toString() !== paidBy)
      .map(split => ({
        userId: split.user,
        // Using the fetched name here 👇
        message: `You owe ₹${Math.round(split.amountOwed)} for "${description}" (Paid by ${payerName})`,
        isRead: false
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`✅ ${notifications.length} Notifications Sent by ${payerName}!`);
    }
    // ---------------------------------------------------------

    res.status(200).json(savedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 5. GET ALL EXPENSES
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find().populate('paidBy', 'name');
    res.json(expenses);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 6. SETTLE UP
router.post('/settle', auth, async (req, res) => {
  try {
    const { group, paidBy, paidTo, amount } = req.body;

    const newExpense = new Expense({
      description: 'Settlement',
      amount,
      paidBy, 
      group,
      category: 'Other',
      splitDetails: [
        { user: paidTo, amountOwed: amount } 
      ],
      date: new Date()
    });

    const saved = await newExpense.save();
    res.json(saved);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Expense = require('../models/Expense');
// const User = require('../models/User');
// const Group = require('../models/Group');
// const auth = require('../middleware/authMiddleware'); 

// <<<<<<< HEAD
// // 1. GET ALL USERS
// router.get('/users', async (req, res) => {
//   try {
//     const users = await User.find();
// =======
// // 1. GET USERS (Protected)
// router.get('/users', auth, async (req, res) => {
//   try {
//     const users = await User.find(); 
// >>>>>>> 23a527acada4074fc25b7d897049e06ccbbb50fb
//     res.json(users);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// <<<<<<< HEAD
// // 2. GET ALL GROUPS (This was likely missing or returning wrong data!)
// router.get('/groups', async (req, res) => {
//   try {
//     // Fetch all groups and populate member details just in case
//     const groups = await Group.find().populate('members', 'name');
// =======
// // 2. GET GROUPS (Protected)
// router.get('/groups', auth, async (req, res) => {
//   try {
//     const groups = await Group.find(); 
// >>>>>>> 23a527acada4074fc25b7d897049e06ccbbb50fb
//     res.json(groups);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// <<<<<<< HEAD
// // 3. GET EXPENSES FOR A SPECIFIC GROUP
// router.get('/group/:groupId', async (req, res) => {
//   try {
//     const expenses = await Expense.find({ group: req.params.groupId }).populate('paidBy', 'name');
//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // 4. ADD EXPENSE
// router.post('/add', async (req, res) => {
//   try {
//     const { description, amount, paidBy, group, category } = req.body;

//     const groupData = await Group.findById(group);
//     if (!groupData) return res.status(404).json({ message: "Group not found" });

//     const splitAmount = amount / groupData.members.length;
//     const splitDetails = groupData.members.map(memberId => ({
//       user: memberId,
//       amountOwed: memberId.toString() === paidBy ? 0 : splitAmount
// =======
// // 3. ADD EXPENSE (Protected + Auto-Split Logic)
// router.post('/add', auth, async (req, res) => {
//   try {
//     // Added 'category' to destructuring
//     const { description, amount, paidBy, group, category } = req.body;

//     // 1. Fetch group to find members
//     const groupData = await Group.findById(group);
//     if (!groupData) return res.status(404).json({ msg: "Group not found" });

//     // 2. Calculate Equal Split
//     const splitAmount = amount / groupData.members.length;

//     // 3. Create "Who Owes Whom" array
//     const splitDetails = groupData.members.map(memberId => ({
//       user: memberId,
//       // If you paid, you owe 0. If someone else paid, they owe the split amount.
//       amountOwed: memberId.toString() === paidBy ? 0 : splitAmount 
// >>>>>>> 23a527acada4074fc25b7d897049e06ccbbb50fb
//     }));

//     const newExpense = new Expense({
//       description,
//       amount,
//       paidBy,
//       group,
// <<<<<<< HEAD
//       category: category || 'Other',
//       splitDetails,
//       date: new Date()
// =======
//       category: category || 'Other', // Save the Category
//       splitDetails: splitDetails     // Save the calculated split
// >>>>>>> 23a527acada4074fc25b7d897049e06ccbbb50fb
//     });

//     const savedExpense = await newExpense.save();
//     res.status(200).json(savedExpense);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json(err);
//   }
// });

// <<<<<<< HEAD
// // 5. GET ALL EXPENSES (Global list)
// router.get('/', async (req, res) => {
// =======
// // 4. LIST EXPENSES (Protected)
// router.get('/', auth, async (req, res) => {
// >>>>>>> 23a527acada4074fc25b7d897049e06ccbbb50fb
//   try {
//     const expenses = await Expense.find().populate('paidBy', 'name');
//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// module.exports = router;

