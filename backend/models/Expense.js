const mongoose = require('mongoose');
const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  category: { type: String, default: 'Other' },
  splitDetails: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, amountOwed: Number }],
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Expense', ExpenseSchema);