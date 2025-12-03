import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Wallet, Users } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Rasayans Tracker 🧪</h1>
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">U</div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Spent</p>
                <h2 className="text-3xl font-bold text-gray-800">₹ 12,450</h2>
              </div>
              <Wallet className="text-green-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
             <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">You Owe</p>
                <h2 className="text-3xl font-bold text-red-500">₹ 850</h2>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-4">
          <Link to="/add-expense">
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              <PlusCircle size={20} />
              <span>Add Expense</span>
            </button>
          </Link>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b font-semibold text-gray-700">Recent Activity</div>
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">🍕</div>
                <div>
                  <p className="font-medium text-gray-800">Late Night Pizza</p>
                  <p className="text-xs text-gray-500">Paid by Arushi • Today</p>
                </div>
              </div>
              <span className="font-bold text-red-500">- ₹450</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;