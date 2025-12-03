import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AddExpense = () => {
  const navigate = useNavigate();
  
  // State for dropdown lists
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '', 
    group: ''   
  });

  // Fetch lists when page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get('http://localhost:5000/api/expenses/users');
        const groupsRes = await axios.get('http://localhost:5000/api/expenses/groups');
        
        setUsers(usersRes.data);
        setGroups(groupsRes.data);

        // Auto-select the first option if available (prevents empty selection bug)
        if (usersRes.data.length > 0) {
          setFormData(prev => ({ ...prev, paidBy: usersRes.data[0]._id }));
        }
        if (groupsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, group: groupsRes.data[0]._id }));
        }
        
      } catch (err) {
        console.error("Error fetching lists:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/expenses/add', formData);
      alert("✅ Expense Saved!");
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("❌ Error saving expense");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold ml-4">Add New Expense</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} 
              className="w-full p-3 border rounded-lg" placeholder="e.g. Taxi Fare" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} 
              className="w-full p-3 border rounded-lg" placeholder="0.00" required />
          </div>

          {/* User Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Who Paid?</label>
            <select name="paidBy" value={formData.paidBy} onChange={handleChange} 
              className="w-full p-3 border rounded-lg bg-white">
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>

          {/* Group Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
            <select name="group" value={formData.group} onChange={handleChange} 
              className="w-full p-3 border rounded-lg bg-white">
              {groups.map(grp => (
                <option key={grp._id} value={grp._id}>{grp.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;