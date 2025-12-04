import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your pages
import Login from './pages/LogIn';
import SignUp from './pages/SignUp'; 
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import CreateGroup from './pages/CreateGroup';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- CHANGE THIS SECTION --- */}
        
        {/* 1. The Home Page ("/") must be LOGIN */}
        <Route path="/" element={<Login />} />
        
        {/* 2. The Signup Page */}
        <Route path="/signup" element={<SignUp />} />

        {/* 3. The Dashboard is moved to "/dashboard" */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* --------------------------- */}

        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/create-group" element={<CreateGroup />} />
      </Routes>
    </Router>
  );
}

export default App;