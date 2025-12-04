import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Wallet, Users } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null); // To store group name & members
  const [totalSpent, setTotalSpent] = useState(0);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Expenses for this Group
        const expRes = await axios.get(`http://localhost:5000/api/expenses/group/${groupId}`);
        setExpenses(expRes.data);

        // 2. Get Group Details (Name & Members) - We reuse the 'groups' list logic or fetch specific
        // Note: For simplicity, we are fetching all groups and finding this one. 
        // A better way is a dedicated GET /api/groups/:id route, but this works with your current backend.
        const groupRes = await axios.get('http://localhost:5000/api/expenses/groups');
        const currentGroup = groupRes.data.find(g => g._id === groupId);
        setGroupInfo(currentGroup);

        // 3. Calculate Total
        const total = expRes.data.reduce((acc, curr) => acc + curr.amount, 0);
        setTotalSpent(total);

        // 4. Prepare Chart
        const categories = {};
        expRes.data.forEach(exp => {
          categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
        });

        setChartData({
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 1,
          }],
        });

      } catch (err) {
        console.error("Error fetching group data", err);
      }
    };
    fetchData();
  }, [groupId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 mr-4">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {groupInfo ? groupInfo.name : 'Loading...'}
              </h1>
              <p className="text-sm text-gray-500">Group Overview</p>
            </div>
          </div>
          
          <Link to="/add-expense">
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow">
              <PlusCircle size={20} /> <span>Add Expense</span>
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* LEFT COLUMN: Stats & Chart (Takes up 2/3 space) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Group Spending</p>
                <h2 className="text-3xl font-bold text-gray-800">₹ {totalSpent}</h2>
              </div>
              <Wallet className="text-purple-500" size={32} />
            </div>

            {/* Members List (NEW FEATURE) */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4 text-gray-700 font-semibold">
                <Users size={20} className="mr-2" /> Members
              </div>
              <div className="flex flex-wrap gap-2">
                {groupInfo && groupInfo.members && groupInfo.members.length > 0 ? (
                  groupInfo.members.map((member) => (
                    <span key={member._id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200">
                      {member.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">Loading members...</span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Chart (Takes up 1/3 space) */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center">
             <h3 className="text-gray-500 text-sm mb-4">Expense Breakdown</h3>
             <div className="w-full max-w-[200px]">
              {chartData ? <Pie data={chartData} /> : <p className="text-xs text-center text-gray-400">No data available</p>}
            </div>
          </div>
        </div>

        {/* EXPENSE LIST */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b font-semibold text-gray-700">Recent Expenses</div>
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense._id} className="flex justify-between items-center p-4 border-b hover:bg-gray-50 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                    {expense.category === 'Food' ? '🍔' : expense.category === 'Travel' ? '🚕' : '📝'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{expense.description}</p>
                    <p className="text-xs text-gray-500">Paid by {expense.paidBy?.name}</p>
                  </div>
                </div>
                <span className="font-bold text-red-500">- ₹{expense.amount}</span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">No expenses in this group yet.</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GroupDetails;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { ArrowLeft, PlusCircle, Wallet } from 'lucide-react';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Pie } from 'react-chartjs-2';

// ChartJS.register(ArcElement, Tooltip, Legend);

// const GroupDetails = () => {
//   const { groupId } = useParams(); // Get the ID from the URL
//   const navigate = useNavigate();
  
//   const [expenses, setExpenses] = useState([]);
//   const [groupName, setGroupName] = useState('Group Details');
//   const [totalSpent, setTotalSpent] = useState(0);
//   const [chartData, setChartData] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // 1. Get Expenses for this Group
//         const expRes = await axios.get(`http://localhost:5000/api/expenses/group/${groupId}`);
//         setExpenses(expRes.data);

//         // 2. Calculate Total
//         const total = expRes.data.reduce((acc, curr) => acc + curr.amount, 0);
//         setTotalSpent(total);

//         // 3. Prepare Chart
//         const categories = {};
//         expRes.data.forEach(exp => {
//           categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
//         });

//         setChartData({
//           labels: Object.keys(categories),
//           datasets: [{
//             data: Object.values(categories),
//             backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
//             borderWidth: 1,
//           }],
//         });

//       } catch (err) {
//         console.error("Error fetching group data", err);
//       }
//     };
//     fetchData();
//   }, [groupId]);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-4xl mx-auto">
        
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-8">
//           <div className="flex items-center">
//             <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 mr-4">
//               <ArrowLeft size={24} />
//             </button>
//             <h1 className="text-3xl font-bold text-gray-800">Group Activity</h1>
//           </div>
          
//           {/* ADD EXPENSE BUTTON (Specific to this group) */}
//           <Link to="/add-expense">
//             <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
//               <PlusCircle size={20} /> <span>Add Expense</span>
//             </button>
//           </Link>
//         </div>

//         {/* STATS AREA (Moved from Dashboard) */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           {/* Total Card */}
//           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 flex justify-between items-center">
//             <div>
//               <p className="text-gray-500 text-sm">Group Total</p>
//               <h2 className="text-3xl font-bold text-gray-800">₹ {totalSpent}</h2>
//             </div>
//             <Wallet className="text-purple-500" size={32} />
//           </div>

//           {/* Chart Card */}
//           <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center">
//              <div className="w-40 h-40">
//               {chartData ? <Pie data={chartData} /> : <p className="text-xs">No data</p>}
//             </div>
//           </div>
//         </div>

//         {/* EXPENSE LIST (Moved from Dashboard) */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="p-4 border-b font-semibold text-gray-700">Recent Expenses</div>
//           {expenses.length > 0 ? (
//             expenses.map((expense) => (
//               <div key={expense._id} className="flex justify-between items-center p-4 border-b hover:bg-gray-50">
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
//             <div className="p-6 text-center text-gray-400">No expenses in this group yet.</div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default GroupDetails;