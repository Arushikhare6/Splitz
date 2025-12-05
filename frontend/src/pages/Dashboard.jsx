import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Wallet, Users, LogOut, ArrowRight, MapPin, Loader, Clock, Moon, Sun, Copy, Check, Bell, X } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [expenses, setExpenses] = useState([]);
  const [myTotalSpent, setMyTotalSpent] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [userName, setUserName] = useState('User');
  const [userId, setUserId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // --- EFFECTS ---

  // 1. Handle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // 2. Fetch Data (Robust / Fail-Safe)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }

    const userString = localStorage.getItem('user');
    let currentUserId = null;
    
    if (userString && userString !== "undefined") {
      try {
        const user = JSON.parse(userString);
        setUserName(user.name);
        setUserId(user.id); 
        currentUserId = user.id;
      } catch (error) {
        localStorage.removeItem('user');
      }
    }

    const fetchData = async () => {
      const config = { headers: { 'x-auth-token': token } };
      
      // We run these independently so one failure doesn't break the whole dashboard
      try {
        // A. FETCH EXPENSES (Critical)
        const expRes = await axios.get('http://localhost:5000/api/expenses', config);
        setExpenses(expRes.data);
        
        // Calculate Totals
        const myExpenses = expRes.data.filter(exp => exp.paidBy && exp.paidBy._id === currentUserId);
        const total = myExpenses.reduce((acc, curr) => acc + curr.amount, 0);
        setMyTotalSpent(total);

        // Chart Data
        const categories = {};
        myExpenses.forEach(exp => {
          const cat = exp.category || 'Other'; 
          categories[cat] = (categories[cat] || 0) + exp.amount;
        });

        setChartData({
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 1,
            borderColor: darkMode ? '#1f2937' : '#ffffff',
          }],
        });
      } catch (err) {
        console.error("Expense Load Error:", err);
        if (err.response?.status === 401) handleLogout();
      }

      try {
        // B. FETCH GROUPS (Non-Critical)
        const groupsRes = await axios.get('http://localhost:5000/api/groups/mygroups', config);
        if (Array.isArray(groupsRes.data)) {
          setGroups(groupsRes.data);
        }
      } catch (err) {
        console.warn("Groups Load Error:", err);
      }

      try {
        // C. FETCH NOTIFICATIONS (Non-Critical)
        const notifRes = await axios.get('http://localhost:5000/api/notifications', config);
        setNotifications(notifRes.data);
      } catch (err) {
        console.warn("Notification Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, darkMode]);

  // --- HANDLERS ---

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCopyLink = (e, groupId) => {
    e.stopPropagation();
    const link = `http://localhost:5173/join/${groupId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(groupId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/mark-read/${id}`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getGroupTotal = (groupId) => {
    return expenses
      .filter(exp => (exp.group === groupId || (exp.group && exp.group._id === groupId)))
      .reduce((sum, curr) => sum + curr.amount, 0);
  };

  if (loading) return <div className="flex justify-center items-center h-screen dark:bg-gray-900"><Loader className="animate-spin text-purple-600" size={40} /></div>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300" onClick={() => setShowNotifPanel(false)}>
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Rasayans Tracker 🧪</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Welcome back, {userName}!</p>
          </div>
          
          <div className="flex items-center space-x-3 self-end sm:self-auto relative">
            
            {/* NOTIFICATION BELL */}
            <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowNotifPanel(!showNotifPanel); }}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm border dark:border-gray-700 hover:bg-gray-100 transition"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* DROPDOWN PANEL */}
                {showNotifPanel && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-3 border-b dark:border-gray-700 font-semibold text-gray-700 dark:text-white flex justify-between items-center">
                            <span>Notifications</span>
                            <span className="text-xs font-normal text-gray-500">{unreadCount} Unread</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <p className="p-4 text-center text-sm text-gray-500">No new notifications</p>
                            ) : (
                                notifications.map(note => (
                                    <div key={note._id} className={`p-3 text-sm border-b dark:border-gray-700 flex justify-between items-start gap-2 ${note.isRead ? 'opacity-50' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                                        <p className="text-gray-700 dark:text-gray-300">{note.message}</p>
                                        {!note.isRead && (
                                            <button onClick={() => markAsRead(note._id)} className="text-gray-400 hover:text-blue-600">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* DARK MODE */}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-yellow-400 shadow-sm border dark:border-gray-700">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* LOGOUT */}
            <button onClick={handleLogout} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center transition-colors">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Your Total Spending</p>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">₹ {myTotalSpent}</h2>
            </div>
            <Wallet className="text-green-500" size={32} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center h-64 transition-colors">
            <h3 className="text-gray-500 dark:text-gray-400 mb-2 text-sm">Your Spending by Category</h3>
            <div className="w-full h-full flex justify-center">
              {chartData && chartData.datasets[0].data.length > 0 ? (
                <Pie data={chartData} options={{ maintainAspectRatio: false }} />
              ) : (
                <p className="text-xs text-gray-400 mt-8 self-center">No spending data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-end mb-8 gap-3 sm:space-x-3">
          <Link to="/create-group" className="w-full sm:w-auto">
            <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow-md">
              <Users size={20} /> <span>New Group</span>
            </button>
          </Link>
          <Link to="/add-expense" className="w-full sm:w-auto">
            <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md">
              <PlusCircle size={20} /> <span>Add Expense</span>
            </button>
          </Link>
        </div>

        {/* YOUR GROUPS */}
        <div className="mb-10">
          <div className="flex items-center mb-4 text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-2">
            <Users size={20} className="mr-2 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-bold">Your Groups</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.length > 0 ? (
              groups.map((group) => {
                const groupTotal = getGroupTotal(group._id);
                return (
                  <div key={group._id} onClick={() => navigate(`/group/${group._id}`)} className="bg-white dark:bg-gray-800 h-60 flex flex-col justify-between rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-6 shadow-md hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-200 shadow-inner">
                          {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <button onClick={(e) => handleCopyLink(e, group._id)} className="text-xs flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded text-gray-500 dark:text-gray-300 transition z-10">
                          {copiedId === group._id ? <Check size={14} className="mr-1 text-green-500" /> : <Copy size={14} className="mr-1" />}
                          {copiedId === group._id ? "Copied" : "Invite"}
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 truncate">{group.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{group.members ? group.members.length : 0} Members</p>
                    </div>
                    <div className="mt-2 pt-3 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Trip Total</span>
                      <div className="flex items-center bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded border border-green-100 dark:border-green-800">
                        <Wallet size={14} className="text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-green-700 dark:text-green-300 font-bold">₹{groupTotal}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 h-48 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <MapPin size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-400 dark:text-gray-500 font-medium">You are not part of any groups.</p>
                <Link to="/create-group" className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-bold mt-1">Create a group now</Link>
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="p-4 border-b font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 flex items-center">
            <Clock size={18} className="mr-2" /> Recent Activity
          </div>
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No expenses found.</p>
            </div>
          ) : (
            expenses.slice().reverse().map((expense) => (
              <div key={expense._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition gap-2">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xl bg-gray-100 dark:bg-gray-700`}>
                    {expense.category === 'Food' ? '🍔' : expense.category === 'Travel' ? '🚕' : expense.category === 'Utilities' ? '💡' : '📝'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white line-clamp-1">{expense.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Paid by {expense.paidBy ? expense.paidBy.name : 'Unknown'} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-right ${expense.paidBy && expense.paidBy._id === userId ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                   {expense.paidBy && expense.paidBy._id === userId ? '+' : '-'} ₹{expense.amount}
                </span>
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
// import { Link, useNavigate } from 'react-router-dom';
// import { PlusCircle, Wallet, Users, LogOut, ArrowRight, MapPin, Loader, Clock, Moon, Sun } from 'lucide-react';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Pie } from 'react-chartjs-2';

// // Register Chart Components
// ChartJS.register(ArcElement, Tooltip, Legend);

// const Dashboard = () => {
//   const navigate = useNavigate();
  
//   // Data State
//   const [expenses, setExpenses] = useState([]);
//   const [myTotalSpent, setMyTotalSpent] = useState(0);
//   const [chartData, setChartData] = useState(null);
//   const [userName, setUserName] = useState('User');
//   const [userId, setUserId] = useState(null);
//   const [groups, setGroups] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Theme State (Dark Mode)
//   const [darkMode, setDarkMode] = useState(() => {
//     return localStorage.getItem('theme') === 'dark';
//   });

//   // --- TOGGLE THEME FUNCTION ---
//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   }, [darkMode]);

//   useEffect(() => {
//     // 1. AUTH CHECK
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/');
//       return;
//     }

//     // 2. GET CURRENT USER ID
//     const userString = localStorage.getItem('user');
//     let currentUserId = null;
    
//     if (userString && userString !== "undefined") {
//       try {
//         const user = JSON.parse(userString);
//         setUserName(user.name);
//         setUserId(user.id); 
//         currentUserId = user.id;
//       } catch (error) {
//         console.error("Corrupt user data found", error);
//         localStorage.removeItem('user');
//       }
//     }

//     // 3. FETCH DATA
//     const fetchData = async () => {
//       try {
//         const config = { headers: { 'x-auth-token': token } };

//         const [expRes, groupsRes] = await Promise.all([
//           axios.get('http://localhost:5000/api/expenses', config),
//           axios.get('http://localhost:5000/api/expenses/groups', config)
//         ]);

//         // A. Process Expenses
//         setExpenses(expRes.data);
        
//         const myExpenses = expRes.data.filter(exp => 
//           exp.paidBy && exp.paidBy._id === currentUserId
//         );

//         const total = myExpenses.reduce((acc, curr) => acc + curr.amount, 0);
//         setMyTotalSpent(total);

//         const categories = {};
//         myExpenses.forEach(exp => {
//           const cat = exp.category || 'Other'; 
//           categories[cat] = (categories[cat] || 0) + exp.amount;
//         });

//         setChartData({
//           labels: Object.keys(categories),
//           datasets: [{
//             data: Object.values(categories),
//             backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
//             borderWidth: 1,
//             borderColor: darkMode ? '#1f2937' : '#ffffff', // Dark mode border for chart
//           }],
//         });

//         // B. Process Groups
//         if (Array.isArray(groupsRes.data)) {
//           const myGroups = groupsRes.data.filter(group => 
//             group.members.some(member => member._id === currentUserId)
//           );
//           const sortedGroups = myGroups.sort((a, b) => (a._id > b._id ? -1 : 1));
//           setGroups(sortedGroups);
//         }

//         setLoading(false);

//       } catch (err) {
//         console.error("Error connecting to backend:", err);
//         if (err.response && err.response.status === 401) {
//           handleLogout();
//         }
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [navigate, darkMode]); // Re-run if theme changes (to update chart colors)

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/');
//   };

//   const getGroupTotal = (groupId) => {
//     return expenses
//       .filter(exp => 
//         (exp.group === groupId || (exp.group && exp.group._id === groupId)) &&
//         exp.description !== 'Settlement'
//       )
//       .reduce((sum, curr) => sum + curr.amount, 0);
//   };

//   if (loading) return <div className="flex justify-center items-center h-screen dark:bg-gray-900"><Loader className="animate-spin text-purple-600" size={40} /></div>;

//   return (
//     // DARK MODE: bg-gray-50 -> dark:bg-gray-900
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
//       <div className="max-w-6xl mx-auto">
        
//         {/* HEADER */}
//         <header className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Rasayans Tracker 🧪</h1>
//             <p className="text-gray-500 dark:text-gray-400">Welcome back, {userName}!</p>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             {/* TOGGLE BUTTON */}
//             <button 
//               onClick={() => setDarkMode(!darkMode)} 
//               className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-yellow-400 shadow-sm hover:shadow-md transition border dark:border-gray-700"
//             >
//               {darkMode ? <Sun size={24} /> : <Moon size={24} />}
//             </button>

//             <button onClick={handleLogout} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full" title="Logout">
//               <LogOut size={24} />
//             </button>
//           </div>
//         </header>

//         {/* STATS SECTION */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
//           {/* PERSONAL TOTAL SPENT CARD */}
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center transition-colors">
//             <div>
//               <p className="text-gray-500 dark:text-gray-400 text-sm">Your Total Spending</p>
//               <h2 className="text-3xl font-bold text-gray-800 dark:text-white">₹ {myTotalSpent}</h2>
//             </div>
//             <Wallet className="text-green-500" size={32} />
//           </div>
          
//           {/* PIE CHART */}
//           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center h-64 transition-colors">
//             <h3 className="text-gray-500 dark:text-gray-400 mb-2 text-sm">Your Spending by Category</h3>
//             <div className="w-full h-full flex justify-center">
//               {chartData && Object.keys(chartData.labels || {}).length > 0 ? (
//                 <Pie data={chartData} options={{ maintainAspectRatio: false }} />
//               ) : (
//                 <p className="text-xs text-gray-400 mt-8 self-center">You haven't spent anything yet</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ACTION BUTTONS */}
//         <div className="flex justify-end mb-8 space-x-3">
//           <Link to="/create-group">
//             <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg transition shadow-md">
//               <Users size={20} />
//               <span>New Group</span>
//             </button>
//           </Link>

//           <Link to="/add-expense">
//             <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition shadow-md">
//               <PlusCircle size={20} />
//               <span>Add Expense</span>
//             </button>
//           </Link>
//         </div>

//         {/* YOUR GROUPS GRID */}
//         <div className="mb-10">
//           <div className="flex items-center mb-4 text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-2">
//             <Users size={20} className="mr-2 text-purple-600 dark:text-purple-400" />
//             <h2 className="text-xl font-bold">Your Groups</h2>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {groups.length > 0 ? (
//               groups.map((group) => {
//                 const groupTotal = getGroupTotal(group._id);
//                 return (
//                   <div 
//                     key={group._id} 
//                     onClick={() => navigate(`/group/${group._id}`)}
//                     className="bg-white dark:bg-gray-800 h-60 flex flex-col justify-between rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-6 shadow-md hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
//                   >
//                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
//                     <div>
//                       <div className="flex justify-between items-start mb-4">
//                         <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-200 shadow-inner">
//                           {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
//                         </div>
//                         <ArrowRight className="text-gray-300 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
//                       </div>
//                       <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 truncate">{group.name}</h3>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">{group.members ? group.members.length : 0} Members</p>
//                     </div>
//                     <div className="mt-2 pt-3 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
//                       <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Trip Total</span>
//                       <div className="flex items-center bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded border border-green-100 dark:border-green-800">
//                         <Wallet size={14} className="text-green-600 dark:text-green-400 mr-1" />
//                         <span className="text-green-700 dark:text-green-300 font-bold">₹{groupTotal}</span>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="col-span-3 h-48 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
//                 <MapPin size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
//                 <p className="text-gray-400 dark:text-gray-500 font-medium">You are not part of any groups.</p>
//                 <Link to="/create-group" className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-bold mt-1">Create a group now</Link>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RECENT ACTIVITY */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
//           <div className="p-4 border-b font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 flex items-center">
//             <Clock size={18} className="mr-2" /> Recent Activity
//           </div>
//           {expenses.length === 0 ? (
//             <div className="p-8 text-center text-gray-500 dark:text-gray-400">
//               <p>No expenses found.</p>
//             </div>
//           ) : (
//             expenses.slice().reverse().map((expense) => (
//               <div key={expense._id} className="flex justify-between items-center p-4 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
//                 <div className="flex items-center space-x-4">
//                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100 dark:bg-gray-700`}>
//                     {expense.category === 'Food' ? '🍔' : 
//                      expense.category === 'Travel' ? '🚕' : 
//                      expense.category === 'Utilities' ? '💡' : '📝'}
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-800 dark:text-white">{expense.description}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       Paid by {expense.paidBy ? expense.paidBy.name : 'Unknown'} • {new Date(expense.date).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//                 <span className={`font-bold ${expense.paidBy && expense.paidBy._id === userId ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
//                    {expense.paidBy && expense.paidBy._id === userId ? '+' : '-'} ₹{expense.amount}
//                 </span>
//               </div>
//             ))
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Dashboard;


