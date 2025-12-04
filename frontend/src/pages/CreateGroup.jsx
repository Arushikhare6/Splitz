import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // 1. Imported Link
import { ArrowLeft, Users, Check, PlusCircle } from 'lucide-react'; // 2. Imported PlusCircle

const CreateGroup = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Fetch users on load
  useEffect(() => {
    axios.get('http://localhost:5000/api/groups/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/groups/create', {
        name: groupName,
        members: selectedMembers
      });
      alert("✅ Group Created!");
      navigate('/');
    } catch (err) {
      alert("Error creating group. Is Backend running?");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-6">
          {/* Left Side: Back Arrow & Title */}
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold ml-4">Create Group</h2>
          </div>

          {/* Right Side: The New "Add Expense" Button */}
          <Link to="/add-expense">
            <button className="flex items-center space-x-1 text-sm bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition">
              <PlusCircle size={16} />
              <span>Add Expense</span>
            </button>
          </Link>
        </div>

        {/* FORM SECTION */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded"
              placeholder="e.g. Goa Trip"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Members</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
              {users.map((user) => (
                <div 
                  key={user._id} 
                  onClick={() => toggleMember(user._id)}
                  className={`flex justify-between items-center p-3 rounded cursor-pointer border transition-all ${
                    selectedMembers.includes(user._id) ? 'bg-blue-50 border-blue-500' : 'bg-white'
                  }`}
                >
                  <span>{user.name}</span>
                  {selectedMembers.includes(user._id) && <Check size={18} className="text-blue-500" />}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded transition">
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;