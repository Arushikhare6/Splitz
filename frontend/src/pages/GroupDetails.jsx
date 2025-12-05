import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Wallet, Users, ArrowRightLeft, Loader, CheckSquare, CheckCircle, Ban } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  // Data State
  const [expenses, setExpenses] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // User State
  const [currentUserId, setCurrentUserId] = useState(null);

  // Settlement State
  const [pendingDebts, setPendingDebts] = useState([]);
  const [settledHistory, setSettledHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (!token) { navigate('/'); return; }
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setCurrentUserId(user.id);
      } catch (e) {
        console.error("User parse error");
      }
    }

    const fetchData = async () => {
      try {
        const config = { headers: { 'x-auth-token': token } };
        
        const [expRes, groupRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/expenses/group/${groupId}`, config),
          axios.get('http://localhost:5000/api/expenses/groups', config)
        ]);

        const expensesList = expRes.data;
        setExpenses(expensesList);

        const currentGroup = groupRes.data.find(g => g._id === groupId);
        setGroupInfo(currentGroup);

        // Calculate Totals
        const total = expensesList.reduce((acc, curr) => {
            return curr.description === 'Settlement' ? acc : acc + curr.amount;
        }, 0);
        setTotalSpent(total);

        // Prepare Chart
        const categories = {};
        expensesList.forEach(exp => {
          if (exp.description !== 'Settlement') {
            const cat = exp.category || 'Other';
            categories[cat] = (categories[cat] || 0) + exp.amount;
          }
        });

        setChartData({
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 1,
            borderColor: '#1f2937', // Dark border for chart
          }],
        });

        if (currentGroup && currentGroup.members.length > 0) {
          calculatePendingDebts(expensesList, currentGroup.members);
          extractSettledHistory(expensesList, currentGroup.members);
        }
        
        setLoading(false);

      } catch (err) {
        console.error("Error fetching data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, navigate]);

  const calculatePendingDebts = (expensesList, members) => {
    let balances = {};
    members.forEach(m => balances[m._id] = { id: m._id, name: m.name, amount: 0 });

    expensesList.forEach(exp => {
      if(exp.paidBy && balances[exp.paidBy._id]) {
          const payerId = exp.paidBy._id;
          const amount = exp.amount;
          balances[payerId].amount += amount;

          if (exp.splitDetails && exp.splitDetails.length > 0) {
             exp.splitDetails.forEach(split => {
                if (balances[split.user]) balances[split.user].amount -= split.amountOwed;
             });
          } else {
             const splitAmount = amount / members.length;
             members.forEach(m => {
                if (balances[m._id]) balances[m._id].amount -= splitAmount;
             });
          }
      }
    });

    let debtors = [];
    let creditors = [];
    Object.values(balances).forEach(person => {
      if (person.amount < -0.01) debtors.push(person);
      else if (person.amount > 0.01) creditors.push(person);
    });

    let transactionList = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      let debtor = debtors[i];
      let creditor = creditors[j];
      let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      amount = Math.round(amount * 100) / 100;

      if (amount > 0) {
        transactionList.push({
            from: debtor,
            to: creditor,
            amount: amount,
            id: `pending-${i}-${j}` 
        });
      }
      debtor.amount += amount;
      creditor.amount -= amount;
      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    setPendingDebts(transactionList);
  };

  const extractSettledHistory = (expensesList, members) => {
    const settlements = expensesList.filter(exp => exp.description === 'Settlement');
    const history = settlements.map(exp => {
      const receiverId = exp.splitDetails[0]?.user;
      const receiver = members.find(m => m._id === receiverId) || { name: 'Unknown' };
      return {
        from: exp.paidBy, 
        to: receiver,     
        amount: exp.amount,
        id: exp._id,
        date: exp.date
      };
    });
    setSettledHistory(history.reverse());
  };

  const handleSettle = async (tx) => {
    if (!window.confirm(`Confirm that ${tx.from.name} has paid ${tx.to.name} ₹${tx.amount}?`)) return;

    try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        
        await axios.post('http://localhost:5000/api/expenses/settle', {
            group: groupId,
            paidBy: tx.from.id,
            paidTo: tx.to.id,
            amount: tx.amount
        }, config);

        window.location.reload(); 

    } catch (err) {
        console.error("Settlement failed", err);
        alert("Failed to settle up.");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen dark:bg-gray-900"><Loader className="animate-spin text-purple-600" size={40} /></div>;

  return (
    // DARK MODE: Main Background
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white mr-4">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {groupInfo ? groupInfo.name : 'Group Details'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trip Overview</p>
            </div>
          </div>
          <Link to="/add-expense">
            <button className="flex items-center space-x-2 bg-black dark:bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-purple-700 transition shadow">
              <PlusCircle size={20} /> <span>Add Expense</span>
            </button>
          </Link>
        </div>

        {/* MEMBERS */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
          <div className="flex items-center text-gray-700 dark:text-gray-200 font-bold mb-3">
            <Users size={20} className="mr-2 text-blue-600 dark:text-blue-400" /> Members
          </div>
          <div className="flex flex-wrap gap-2">
            {groupInfo && groupInfo.members ? (
              groupInfo.members.map((member) => (
                <span key={member._id} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800">
                  {member.name}
                </span>
              ))
            ) : ( <span className="text-gray-400 text-sm">Loading...</span> )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* TOTAL COST */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center transition-colors">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Trip Cost</p>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white mt-1">₹ {totalSpent}</h2>
              </div>
              <Wallet className="text-green-500 opacity-80" size={40} />
            </div>

            {/* --- SETTLEMENTS UI (Dark Mode Updated) --- */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center text-gray-800 dark:text-white font-bold mb-4">
                <ArrowRightLeft size={20} className="mr-2 text-purple-600 dark:text-purple-400" /> Settlements
              </div>
              
              <div className="space-y-3">
                {/* 1. PENDING DEBTS (Red) */}
                {pendingDebts.map((tx, index) => {
                    const canSettle = currentUserId === tx.from.id || currentUserId === tx.to.id;

                    return (
                        <div key={tx.id} className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 transition-colors">
                        <div className="flex items-center text-gray-700 dark:text-gray-200 font-medium">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                            <span>{tx.from.name} owes {tx.to.name} <span className="font-bold text-gray-900 dark:text-white">₹{tx.amount}</span></span>
                        </div>
                        
                        {/* CONDITIONAL BUTTON */}
                        {canSettle ? (
                            <button 
                                onClick={() => handleSettle(tx)}
                                className="flex items-center text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 hover:border-green-300 transition"
                            >
                                <CheckSquare size={14} className="mr-1" /> Mark Paid
                            </button>
                        ) : (
                            <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 px-2">
                                <Ban size={12} className="mr-1" /> Not your debt
                            </div>
                        )}
                        </div>
                    );
                })}

                {/* 2. PAID HISTORY (Green) */}
                {settledHistory.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30 opacity-75 transition-colors">
                      <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span className="line-through text-gray-500 dark:text-gray-400 mr-2">{tx.from.name} owes {tx.to.name}</span>
                        <span className="font-bold text-green-700 dark:text-green-400">Paid ₹{tx.amount}</span>
                      </div>
                      <div className="flex items-center text-xs text-green-700 dark:text-green-400 font-bold px-3 py-1.5">
                        <CheckCircle size={14} className="mr-1" /> PAID
                      </div>
                    </div>
                ))}

                {pendingDebts.length === 0 && settledHistory.length === 0 && (
                  <div className="text-gray-400 text-sm italic p-2">No debts yet!</div>
                )}
              </div>
            </div>
          </div>

          {/* CHART */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 transition-colors">
             <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">Spending Breakdown</h3>
             <div className="w-full h-48 flex justify-center">
              {chartData && Object.keys(chartData.labels).length > 0 ? (
                 <Pie data={chartData} options={{ maintainAspectRatio: false }} /> 
              ) : ( <p className="text-xs text-center text-gray-400 self-center">No data available</p> )}
            </div>
          </div>
        </div>

        {/* EXPENSE LIST */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-750 border-gray-100 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200">Expense History</div>
          {expenses.length > 0 ? (
            expenses
              .filter(exp => exp.description !== 'Settlement')
              .slice().reverse()
              .map((expense) => (
              <div key={expense._id} className="flex justify-between items-center p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 last:border-0 transition">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100 dark:bg-gray-700`}>
                    {expense.category === 'Food' ? '🍔' : expense.category === 'Travel' ? '🚕' : expense.category === 'Utilities' ? '💡' : '📝'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{expense.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid by {expense.paidBy ? expense.paidBy.name : 'Unknown'}</p>
                  </div>
                </div>
                <span className="font-bold text-red-500 dark:text-red-400">
                   - ₹{expense.amount}
                </span>
              </div>
            ))
          ) : ( <div className="p-8 text-center text-gray-400">No expenses added yet.</div> )}
        </div>

      </div>
    </div>
  );
};

export default GroupDetails;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { ArrowLeft, PlusCircle, Wallet, Users, ArrowRightLeft, Loader } from 'lucide-react';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Pie } from 'react-chartjs-2';

// ChartJS.register(ArcElement, Tooltip, Legend);

// const GroupDetails = () => {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
  
//   const [expenses, setExpenses] = useState([]);
//   const [groupInfo, setGroupInfo] = useState(null);
//   const [totalSpent, setTotalSpent] = useState(0);
//   const [chartData, setChartData] = useState(null);
//   const [settlements, setSettlements] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // 1. GET TOKEN (The Key)
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/'); // Redirect to login if no token
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         // 2. ATTACH TOKEN TO HEADERS
//         const config = { headers: { 'x-auth-token': token } };

//         // 3. FETCH DATA WITH HEADERS
//         const [expRes, groupRes] = await Promise.all([
//           axios.get(`http://localhost:5000/api/expenses/group/${groupId}`, config),
//           axios.get('http://localhost:5000/api/expenses/groups', config)
//         ]);

//         setExpenses(expRes.data);

//         // Find Current Group Info
//         const currentGroup = groupRes.data.find(g => g._id === groupId);
//         setGroupInfo(currentGroup);

//         // Calculate Totals
//         const total = expRes.data.reduce((acc, curr) => acc + curr.amount, 0);
//         setTotalSpent(total);

//         // Prepare Chart
//         const categories = {};
//         expRes.data.forEach(exp => {
//           const cat = exp.category || 'Other';
//           categories[cat] = (categories[cat] || 0) + exp.amount;
//         });

//         setChartData({
//           labels: Object.keys(categories),
//           datasets: [{
//             data: Object.values(categories),
//             backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
//             borderWidth: 1,
//           }],
//         });

//         // Calculate Settlements
//         if (currentGroup && currentGroup.members.length > 0) {
//           calculateDebts(expRes.data, currentGroup.members);
//         }
        
//         setLoading(false);

//       } catch (err) {
//         console.error("Error fetching group data", err);
//         // If token expired, logout
//         if (err.response && err.response.status === 401) {
//           localStorage.removeItem('token');
//           navigate('/');
//         }
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [groupId, navigate]);

//   const calculateDebts = (expenses, members) => {
//     let balances = {};
//     members.forEach(m => balances[m._id] = { name: m.name, amount: 0 });

//     expenses.forEach(exp => {
//       // Safety check: ensure paidBy exists
//       if(exp.paidBy && balances[exp.paidBy._id]) {
//           const payerId = exp.paidBy._id;
//           const amount = exp.amount;
//           const splitAmount = amount / members.length;

//           balances[payerId].amount += amount;

//           members.forEach(m => {
//             if (balances[m._id]) balances[m._id].amount -= splitAmount;
//           });
//       }
//     });

//     let debtors = [];
//     let creditors = [];

//     Object.values(balances).forEach(person => {
//       if (person.amount < -0.01) debtors.push(person);
//       else if (person.amount > 0.01) creditors.push(person);
//     });

//     let transactionList = [];
//     let i = 0;
//     let j = 0;

//     while (i < debtors.length && j < creditors.length) {
//       let debtor = debtors[i];
//       let creditor = creditors[j];
//       let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
//       amount = Math.round(amount * 100) / 100;

//       if (amount > 0) {
//         transactionList.push(`${debtor.name} pays ${creditor.name} ₹${amount}`);
//       }

//       debtor.amount += amount;
//       creditor.amount -= amount;

//       if (Math.abs(debtor.amount) < 0.01) i++;
//       if (creditor.amount < 0.01) j++;
//     }

//     setSettlements(transactionList);
//   };

//   if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-purple-600" size={40} /></div>;

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-5xl mx-auto">
        
//         {/* HEADER */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//           <div className="flex items-center">
//             <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700 mr-4">
//               <ArrowLeft size={24} />
//             </button>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">
//                 {groupInfo ? groupInfo.name : 'Group Details'}
//               </h1>
//               <p className="text-sm text-gray-500">Trip Overview</p>
//             </div>
//           </div>
          
//           <Link to="/add-expense">
//             <button className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow">
//               <PlusCircle size={20} /> <span>Add Expense</span>
//             </button>
//           </Link>
//         </div>

//         {/* MEMBERS LIST */}
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
//           <div className="flex items-center text-gray-700 font-bold mb-3">
//             <Users size={20} className="mr-2 text-blue-600" /> Members
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {groupInfo && groupInfo.members ? (
//               groupInfo.members.map((member) => (
//                 <span key={member._id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
//                   {member.name}
//                 </span>
//               ))
//             ) : (
//               <span className="text-gray-400 text-sm">Loading members...</span>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
//           {/* STATS & SETTLEMENTS */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
//               <div>
//                 <p className="text-gray-500 text-sm font-medium">Total Trip Cost</p>
//                 <h2 className="text-4xl font-bold text-gray-800 mt-1">₹ {totalSpent}</h2>
//               </div>
//               <Wallet className="text-green-500 opacity-80" size={40} />
//             </div>

//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//               <div className="flex items-center text-gray-800 font-bold mb-4">
//                 <ArrowRightLeft size={20} className="mr-2 text-purple-600" /> Settlements
//               </div>
              
//               {settlements.length > 0 ? (
//                 <ul className="space-y-3">
//                   {settlements.map((tx, index) => (
//                     <li key={index} className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-700 font-medium">
//                       <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
//                       {tx}
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <div className="text-gray-400 text-sm italic p-2">
//                   No debts! Everyone is settled up.
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* CHART */}
//           <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
//              <h3 className="text-gray-500 text-sm font-bold mb-4 uppercase tracking-wider">Spending Breakdown</h3>
//              <div className="w-full h-48 flex justify-center">
//               {chartData && Object.keys(chartData.labels).length > 0 ? (
//                  <Pie data={chartData} options={{ maintainAspectRatio: false }} /> 
//               ) : (
//                  <p className="text-xs text-center text-gray-400 self-center">No data available</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* EXPENSE LIST */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
//           <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700">Expense History</div>
//           {expenses.length > 0 ? (
//             expenses.slice().reverse().map((expense) => (
//               <div key={expense._id} className="flex justify-between items-center p-4 border-b hover:bg-gray-50 last:border-0 transition">
//                 <div className="flex items-center space-x-4">
//                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100`}>
//                     {expense.category === 'Food' ? '🍔' : 
//                      expense.category === 'Travel' ? '🚕' : 
//                      expense.category === 'Utilities' ? '💡' : '📝'}
//                   </div>
//                   <div>
//                     <p className="font-bold text-gray-800">{expense.description}</p>
//                     <p className="text-xs text-gray-500">Paid by {expense.paidBy ? expense.paidBy.name : 'Unknown'}</p>
//                   </div>
//                 </div>
//                 <span className="font-bold text-red-500">- ₹{expense.amount}</span>
//               </div>
//             ))
//           ) : (
//             <div className="p-8 text-center text-gray-400">No expenses added yet.</div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default GroupDetails;


