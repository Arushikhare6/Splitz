import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react'; // Import Spinner Icon

const JoinGroup = () => {
  const { groupId } = useParams(); 
  const navigate = useNavigate();
  const hasCalledAPI = useRef(false); // 1. Fix for React Double-Effect Issue

  useEffect(() => {
    const joinGroup = async () => {
      // Prevent the function from running twice
      if (hasCalledAPI.current) return;
      hasCalledAPI.current = true;

      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("Please login first to join this group.");
        navigate('/'); 
        return;
      }

      try {
        await axios.post(`http://localhost:5000/api/groups/join/${groupId}`, {}, {
          headers: { 'x-auth-token': token }
        });
        
        // Success
        alert("🎉 You have successfully joined the group!");
        navigate('/dashboard');

      } catch (err) {
        // Handle "Already Member" vs "Real Error"
        if (err.response?.status === 400) {
            alert("You are already a member of this group!");
        } else {
            console.error(err);
            alert("Failed to join group. The link might be invalid.");
        }
        navigate('/dashboard');
      }
    };

    joinGroup();
  }, [groupId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-700">Joining Group...</h2>
        <p className="text-gray-500 text-sm mt-2">Please wait while we verify the link.</p>
      </div>
    </div>
  );
};

export default JoinGroup;