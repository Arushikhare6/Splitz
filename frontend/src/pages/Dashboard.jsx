import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, Wallet, Users } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart Components for the Visualization
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch Real Data from Backend
    axios.get('http://localhost:5000/api/expenses')
      .then(res => {
        setExpenses(res.data);
        
        // 1. Calculate Total Spent
        const total = res.data.reduce((acc, curr) => acc + curr.amount, 0);
        setTotalSpent(total);

        // 2. Prepare Data for Pie Chart (Group by Category)
        const categories = {};
        res.data.forEach(exp => {
          const cat = exp.category || 'Other'; 
          categories[cat] = (categories[cat] || 0) + exp.amount;
        });

        setChartData({
          labels: Object.keys(categories),
          datasets: [
            {
              data: Object.values(categories),
              backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(err => console.error("Error connecting to backend:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">SPLITZZ</h1>
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">U</div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Card 1: Total Spent */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Group Spending</p>
              <h2 className="text-3xl font-bold text-gray-800">₹ {totalSpent}</h2>
            </div>
            <Wallet className="text-green-500" size={32} />
          </div>
          
          {/* Card 2: Spending Visualization (Pie Chart) */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-gray-500 mb-2 text-sm">Spending by Category</h3>
            <div className="w-48 h-48">
              {chartData ? <Pie data={chartData} /> : <p className="text-xs text-gray-400">Add an expense to see chart...</p>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mb-4 space-x-3">
           {/* 1. New Create Group Button */}
          <Link to="/create-group">
            <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
              <Users size={20} />
              <span>New Group</span>
            </button>
          </Link>

          {/* 2. Add Expense Button */}
          <Link to="/add-expense">
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              <PlusCircle size={20} />
              <span>Add Expense</span>
            </button>
          </Link>
        </div>

        {/* Recent Transactions List (Dynamic) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b font-semibold text-gray-700">Recent Activity</div>
          
          {expenses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No expenses yet. Click "Add Expense" to start!</div>
          ) : (
            expenses.map((expense) => (
              <div key={expense._id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {/* Dynamic Category Icon */}
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                    {expense.category === 'Food' ? '🍔' : 
                     expense.category === 'Travel' ? '🚕' : 
                     expense.category === 'Utilities' ? '💡' : 
                     expense.category === 'Entertainment' ? '🎬' : '📝'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{expense.description}</p>
                    <p className="text-xs text-gray-500">
                      {/* Safety Check: Prevents crash if User is deleted */}
                      Paid by {expense.paidBy ? expense.paidBy.name : 'Unknown'} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-red-500">- ₹{expense.amount}</span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;