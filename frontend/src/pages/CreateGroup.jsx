import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check } from 'lucide-react';

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
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold ml-4">Create Group</h2>
        </div>

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
                  className={`flex justify-between p-3 rounded cursor-pointer border ${
                    selectedMembers.includes(user._id) ? 'bg-blue-50 border-blue-500' : 'bg-white'
                  }`}
                >
                  <span>{user.name}</span>
                  {selectedMembers.includes(user._id) && <Check size={18} className="text-blue-500" />}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded">
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;