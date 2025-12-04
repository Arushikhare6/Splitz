import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Wallet, Users, LogOut, ArrowRight, MapPin, Loader, Clock } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart Components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State from Code A (Auth & Expenses)
  const [expenses, setExpenses] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [userName, setUserName] = useState('User');
  
  // State from Code B (Groups)
  const [groups, setGroups] = useState([]);
  
  // Shared State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- 1. AUTH CHECK (From Code A) ---
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Safely Parse User Data
    const userString = localStorage.getItem('user');
    if (userString && userString !== "undefined") {
      try {
        const user = JSON.parse(userString);
        setUserName(user.name);
      } catch (error) {
        console.error("Corrupt user data found, clearing...", error);
        localStorage.removeItem('user');
      }
    }

    // --- 2. DATA FETCHING (Combined A & B) ---
    const fetchData = async () => {
      try {
        const config = { headers: { 'x-auth-token': token } };

        // Fetch Both Expenses AND Groups in parallel
        const [expRes, groupsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/expenses', config),
          axios.get('http://localhost:5000/api/expenses/groups', config)
        ]);

        // --- Process Expenses (Code A Logic) ---
        setExpenses(expRes.data);
        
        // Calculate Total
        const total = expRes.data.reduce((acc, curr) => acc + curr.amount, 0);
        setTotalSpent(total);

        // Calculate Chart Data
        const categories = {};
        expRes.data.forEach(exp => {
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

        // --- Process Groups (Code B Logic) ---
        if (Array.isArray(groupsRes.data)) {
          // Sort by newest
          const sortedGroups = groupsRes.data.sort((a, b) => (a._id > b._id ? -1 : 1));
          setGroups(sortedGroups);
        }

        setLoading(false);

      } catch (err) {
        console.error("Error connecting to backend:", err);
        if (err.response && err.response.status === 401) {
          handleLogout();
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Helper to calculate total per group (From Code B)
  const getGroupTotal = (groupId) => {
    return expenses
      .filter(exp => exp.group === groupId || (exp.group && exp.group._id === groupId))
      .reduce((sum, curr) => sum + curr.amount, 0);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-purple-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">SPLITZ</h1>
            <p className="text-gray-500">Welcome back, {userName}!</p>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full" title="Logout">
            <LogOut size={24} />
          </button>
        </header>

        {/* --- GLOBAL STATS SECTION (From Code A) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Spent Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Personal Spending</p>
              <h2 className="text-3xl font-bold text-gray-800">₹ {totalSpent}</h2>
            </div>
            <Wallet className="text-green-500" size={32} />
          </div>
          
          {/* Pie Chart Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center h-64">
            <h3 className="text-gray-500 mb-2 text-sm">Spending by Category</h3>
            <div className="w-full h-full flex justify-center">
              {chartData && Object.keys(chartData).length > 0 ? (
                <Pie data={chartData} options={{ maintainAspectRatio: false }} />
              ) : (
                <p className="text-xs text-gray-400 mt-8 self-center">Add expenses to see chart</p>
              )}
            </div>
          </div>
        </div>

        {/* --- ACTION BUTTONS (Combined) --- */}
        <div className="flex justify-end mb-8 space-x-3">
          <Link to="/create-group">
            <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg transition shadow-md">
              <Users size={20} />
              <span>New Group</span>
            </button>
          </Link>

          <Link to="/add-expense">
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition shadow-md">
              <PlusCircle size={20} />
              <span>Add Expense</span>
            </button>
          </Link>
        </div>

        {/* --- GROUPS GRID SECTION (From Code B) --- */}
        <div className="mb-10">
          <div className="flex items-center mb-4 text-gray-700 border-b pb-2">
            <Users size={20} className="mr-2 text-purple-600" />
            <h2 className="text-xl font-bold">Your Groups</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.length > 0 ? (
              groups.map((group) => {
                const groupTotal = getGroupTotal(group._id);
                return (
                  <div 
                    key={group._id} 
                    onClick={() => navigate(`/group/${group._id}`)}
                    className="bg-white h-60 flex flex-col justify-between rounded-2xl border-2 border-gray-100 p-6 shadow-md hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl font-bold text-gray-700 shadow-inner">
                          {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <ArrowRight className="text-gray-300 group-hover:text-purple-600 transition" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.members ? group.members.length : 0} Members</p>
                    </div>
                    <div className="mt-2 pt-3 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
                      <div className="flex items-center bg-green-50 px-2 py-1 rounded border border-green-100">
                        <Wallet size={14} className="text-green-600 mr-1" />
                        <span className="text-green-700 font-bold">₹{groupTotal}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 h-48 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <MapPin size={40} className="text-gray-300 mb-2" />
                <p className="text-gray-400 font-medium">No groups yet.</p>
                <Link to="/create-group" className="text-purple-600 hover:underline text-sm font-bold mt-1">Create one now</Link>
              </div>
            )}
          </div>
        </div>

        {/* --- RECENT ACTIVITY LIST (From Code A) --- */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 border-b font-semibold text-gray-700 bg-gray-50 flex items-center">
            <Clock size={18} className="mr-2" /> Recent Activity
          </div>
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No expenses found.</p>
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



// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import { PlusCircle, Wallet, Users } from 'lucide-react';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Pie } from 'react-chartjs-2';

// // Register Chart Components for the Visualization
// ChartJS.register(ArcElement, Tooltip, Legend);

// const Dashboard = () => {
//   const [expenses, setExpenses] = useState([]);
//   const [totalSpent, setTotalSpent] = useState(0);
//   const [chartData, setChartData] = useState(null);

//   useEffect(() => {
//     // Fetch Real Data from Backend
//     axios.get('http://localhost:5000/api/expenses')
//       .then(res => {
//         setExpenses(res.data);
        
//         // 1. Calculate Total Spent
//         const total = res.data.reduce((acc, curr) => acc + curr.amount, 0);
//         setTotalSpent(total);

//         // 2. Prepare Data for Pie Chart (Group by Category)
//         const categories = {};
//         res.data.forEach(exp => {
//           const cat = exp.category || 'Other'; 
//           categories[cat] = (categories[cat] || 0) + exp.amount;
//         });

//         setChartData({
//           labels: Object.keys(categories),
//           datasets: [
//             {
//               data: Object.values(categories),
//               backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
//               borderWidth: 1,
//             },
//           ],
//         });
//       })
//       .catch(err => console.error("Error connecting to backend:", err));
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-4xl mx-auto">
        
//         {/* Header */}
//         <header className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">SPLITZZ</h1>
//           <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">U</div>
//         </header>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
//           {/* Card 1: Total Spent */}
//           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
//             <div>
//               <p className="text-gray-500 text-sm">Total Group Spending</p>
//               <h2 className="text-3xl font-bold text-gray-800">₹ {totalSpent}</h2>
//             </div>
//             <Wallet className="text-green-500" size={32} />
//           </div>
          
//           {/* Card 2: Spending Visualization (Pie Chart) */}
//           <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center">
//             <h3 className="text-gray-500 mb-2 text-sm">Spending by Category</h3>
//             <div className="w-48 h-48">
//               {chartData ? <Pie data={chartData} /> : <p className="text-xs text-gray-400">Add an expense to see chart...</p>}
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-end mb-4 space-x-3">
//            {/* 1. New Create Group Button */}
//           <Link to="/create-group">
//             <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
//               <Users size={20} />
//               <span>New Group</span>
//             </button>
//           </Link>

//           {/* 2. Add Expense Button */}
//           <Link to="/add-expense">
//             <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
//               <PlusCircle size={20} />
//               <span>Add Expense</span>
//             </button>
//           </Link>
//         </div>

//         {/* Recent Transactions List (Dynamic) */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="p-4 border-b font-semibold text-gray-700">Recent Activity</div>
          
//           {expenses.length === 0 ? (
//             <div className="p-6 text-center text-gray-500">No expenses yet. Click "Add Expense" to start!</div>
//           ) : (
//             expenses.map((expense) => (
//               <div key={expense._id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50">
//                 <div className="flex items-center space-x-4">
//                   {/* Dynamic Category Icon */}
//                   <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
//                     {expense.category === 'Food' ? '🍔' : 
//                      expense.category === 'Travel' ? '🚕' : 
//                      expense.category === 'Utilities' ? '💡' : 
//                      expense.category === 'Entertainment' ? '🎬' : '📝'}
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-800">{expense.description}</p>
//                     <p className="text-xs text-gray-500">
//                       {/* Safety Check: Prevents crash if User is deleted */}
//                       Paid by {expense.paidBy ? expense.paidBy.name : 'Unknown'} • {new Date(expense.date).toLocaleDateString()}
//                     </p>
//                   </div>

//                 </div>
//               );
//             })
//           ) : (
//             // EMPTY STATE BOX (If no groups exist)
//             !loading && (
//               <div className="col-span-3 h-64 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-300">
//                 <MapPin size={48} className="text-slate-300 mb-4" />
//                 <h3 className="text-xl font-bold text-slate-400">No trips added yet</h3>
//                 <Link to="/create-group" className="mt-2 text-purple-600 font-bold hover:underline">
//                   Create your first trip
//                 </Link>
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


