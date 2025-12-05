import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, Loader2 } from 'lucide-react';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Users (With Token)
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login first");
        navigate('/');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/groups/users', {
          headers: { 'x-auth-token': token } // <--- CRITICAL: Send Token
        });
        
        // Filter out the current user (optional, prevents selecting yourself twice)
        // You can get current user ID from localStorage if you want strictly filter UI
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  // Handle Checkbox Toggle
  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // 2. Create Group (With Token)
      await axios.post('http://localhost:5000/api/groups/create', 
        {
          name: groupName,
          members: selectedMembers
        },
        {
          headers: { 'x-auth-token': token } // <--- CRITICAL: Send Token
        }
      );
      
      alert("✅ Group Created Successfully!");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error creating group");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-purple-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold ml-4 text-gray-800">Create New Group</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <div className="flex items-center border rounded-lg p-3 bg-gray-50 focus-within:ring-2 focus-within:ring-purple-500">
              <Users size={20} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="e.g. Goa Trip 2025" 
                className="bg-transparent outline-none w-full text-gray-700"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              {users.length === 0 ? (
                <p className="text-sm text-gray-400 text-center p-2">No other users found.</p>
              ) : (
                users.map((user) => (
                  <div 
                    key={user._id} 
                    onClick={() => toggleMember(user._id)}
                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-all ${
                      selectedMembers.includes(user._id) 
                      ? 'bg-purple-50 border-purple-500 shadow-sm' 
                      : 'bg-white border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">{user.name}</span>
                    </div>
                    {selectedMembers.includes(user._id) && <Check size={18} className="text-purple-600" />}
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">
              {selectedMembers.length} members selected (You are added automatically)
            </p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition transform active:scale-[0.98] shadow-md"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;