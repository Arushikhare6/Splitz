import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Wallet, Users, LogOut } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart Components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for Token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // 2. Safely Parse User Data (Fixes your "undefined" error)
    const userString = localStorage.getItem('user');
    if (userString && userString !== "undefined") {
      try {
        const user = JSON.parse(userString);
        setUserName(user.name);
      } catch (error) {
        console.error("Corrupt user data found, clearing...", error);
        localStorage.removeItem('user'); // Auto-fix the bad data
      }
    }

    // 3. Fetch Data
    axios.get('http://localhost:5000/api/expenses', {
      headers: { 'x-auth-token': token }
    })
      .then(res => {
        setExpenses(res.data);
        
        const total = res.data.reduce((acc, curr) => acc + curr.amount, 0);
        setTotalSpent(total);

        const categories = {};
        res.data.forEach(exp => {
          const cat = exp.category || 'Other'; 
          categories[cat] = (categories[cat] || 0) + exp.amount;
        });

        setChartData({
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 1,
          }],
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error connecting to backend:", err);
        if (err.response && err.response.status === 401) {
          handleLogout();
        }
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Rasayans Tracker 🧪</h1>
            <p className="text-gray-500">Welcome back, {userName}!</p>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition" title="Logout">
            <LogOut size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Group Spending</p>
              <h2 className="text-3xl font-bold text-gray-800">₹ {totalSpent}</h2>
            </div>
            <Wallet className="text-green-500" size={32} />
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-gray-500 mb-2 text-sm">Spending by Category</h3>
            <div className="w-48 h-48">
              {chartData && Object.keys(chartData).length > 0 ? (
                <Pie data={chartData} />
              ) : (
                <p className="text-xs text-gray-400 mt-8">Add expenses to see chart</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-4 space-x-3">
          <Link to="/create-group">
            <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition shadow-md">
              <Users size={20} />
              <span>New Group</span>
            </button>
          </Link>

          <Link to="/add-expense">
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-md">
              <PlusCircle size={20} />
              <span>Add Expense</span>
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 border-b font-semibold text-gray-700 bg-gray-50">Recent Activity</div>
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No expenses found.</p>
              <p className="text-sm">Click "Add Expense" to get started!</p>
            </div>
          ) : (
            expenses.slice().reverse().map((expense) => (
              <div key={expense._id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 transition">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100`}>
                    {expense.category === 'Food' ? '🍔' : 
                     expense.category === 'Travel' ? '🚕' : 
                     expense.category === 'Utilities' ? '💡' : '📝'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{expense.description}</p>
                    <p className="text-xs text-gray-500">
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