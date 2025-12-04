import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Loader, Wallet, MapPin } from 'lucide-react';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, expensesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/expenses/groups'),
          axios.get('http://localhost:5000/api/expenses')
        ]);

        if (Array.isArray(groupsRes.data)) {
          // Sort groups: Newest first
          const sortedGroups = groupsRes.data.sort((a, b) => (a._id > b._id ? -1 : 1));
          setGroups(sortedGroups);
        }
        if (Array.isArray(expensesRes.data)) {
          setExpenses(expensesRes.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGroupTotal = (groupId) => {
    return expenses
      .filter(exp => exp.group === groupId)
      .reduce((sum, curr) => sum + curr.amount, 0);
  };

  return (
    // 1. PAGE BACKGROUND: Darker Gray (bg-slate-100) so white boxes pop out
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">SPLITZZ 💸</h1>
            <p className="text-slate-500 mt-1 font-medium">Your Trips & Groups</p>
          </div>
          <Link to="/create-group">
            <button className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition shadow-lg font-bold">
              <Users size={20} /> <span>New Trip</span>
            </button>
          </Link>
        </header>

        {loading && (
          <div className="flex justify-center p-20">
            <Loader className="animate-spin text-black" size={40} />
          </div>
        )}

        {/* 2. THE GRID CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {!loading && groups.length > 0 ? (
            groups.map((group) => {
              const totalAmount = getGroupTotal(group._id);

              return (
                // 3. THE GROUP BOX (Card Style)
                <div 
                  key={group._id} 
                  onClick={() => navigate(`/group/${group._id}`)}
                  // Styling: White Box, Thick Border, Shadow, Rounded Corners
                  className="bg-white h-64 flex flex-col justify-between rounded-2xl border-2 border-slate-200 p-6 shadow-lg hover:shadow-2xl hover:border-purple-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                >
                  {/* Colorful Top Strip */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>

                  {/* Card Main Content */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      {/* Icon Bubble */}
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shadow-inner text-slate-700 font-bold">
                        {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <ArrowRight className="text-slate-300 group-hover:text-purple-600 transition transform group-hover:translate-x-1" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-1 truncate">{group.name}</h3>
                    
                    <div className="flex items-center text-slate-500 text-sm font-medium">
                      <Users size={16} className="mr-1" />
                      <span>{group.members ? group.members.length : 0} Members</span>
                    </div>
                  </div>

                  {/* Footer: Total Spent */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Spent</span>
                    <div className="flex items-center bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                      <Wallet size={16} className="text-green-600 mr-2" />
                      <span className="text-green-700 font-bold text-lg">₹{totalAmount}</span>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            // EMPTY STATE BOX (If no groups exist)
            !loading && (
              <div className="col-span-3 h-64 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-300">
                <MapPin size={48} className="text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">No trips added yet</h3>
                <Link to="/create-group" className="mt-2 text-purple-600 font-bold hover:underline">
                  Create your first trip
                </Link>
              </div>
            )
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
// import { Wallet, Users } from 'lucide-react'; // Removed PlusCircle, ChevronDown/Up
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Pie } from 'react-chartjs-2';

// ChartJS.register(ArcElement, Tooltip, Legend);

// const Dashboard = () => {
//   const [expenses, setExpenses] = useState([]);
//   const [totalSpent, setTotalSpent] = useState(0);
//   const [chartData, setChartData] = useState(null);

//   useEffect(() => {
//     // Fetch expenses
//     axios.get('http://localhost:5000/api/expenses')
//       .then(res => {
//         setExpenses(res.data);
        
//         // Calculate Total
//         const total = res.data.reduce((acc, curr) => acc + curr.amount, 0);
//         setTotalSpent(total);

//         // Prepare Chart Data
//         const categories = {};
//         res.data.forEach(exp => {
//           categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
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
//       .catch(err => console.error("Error fetching data:", err));
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-4xl mx-auto">
        
//         {/* HEADER */}
//         <header className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">SPLITZZ 💸</h1>
          
//           {/* ONLY "NEW GROUP" BUTTON VISIBLE */}
//           <Link to="/create-group">
//             <button className="flex items-center space-x-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition shadow-md font-medium">
//               <Users size={20} /> <span>New Group</span>
//             </button>
//           </Link>
//         </header>

//         {/* STATS CARDS */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
//             <div>
//               <p className="text-gray-500 text-sm">Total Group Spending</p>
//               <h2 className="text-3xl font-bold text-gray-800">₹ {totalSpent}</h2>
//             </div>
//             <Wallet className="text-green-500" size={32} />
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center">
//             <h3 className="text-gray-500 mb-2 text-sm">Spending by Category</h3>
//             <div className="w-48 h-48">
//               {chartData ? <Pie data={chartData} /> : <p className="text-xs text-gray-400">Add an expense to see chart</p>}
//             </div>
//           </div>
//         </div>
        
//         {/* RECENT ACTIVITY LIST */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="p-4 border-b font-semibold text-gray-700">Recent Activity</div>
//           {expenses.length > 0 ? (
//             expenses.map((expense) => (
//               <div key={expense._id} className="flex justify-between items-center p-4 border-b hover:bg-gray-50 last:border-0">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
//                     {expense.category === 'Food' ? '🍔' : expense.category === 'Travel' ? '🚕' : '📝'}
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-800">{expense.description}</p>
//                     <p className="text-xs text-gray-500">Paid by {expense.paidBy?.name}</p>
//                   </div>
//                 </div>
//                 <span className="font-bold text-red-500">- ₹{expense.amount}</span>
//               </div>
//             ))
//           ) : (
//             <div className="p-6 text-center text-gray-400">No expenses recorded yet.</div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Dashboard;


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
//                 <span className="font-bold text-red-500">- ₹{expense.amount}</span>
//               </div>
//             ))
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Dashboard;