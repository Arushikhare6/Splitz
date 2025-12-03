import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import CreateGroup from './pages/CreateGroup'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/create-group" element={<CreateGroup />} /> 
      </Routes>
    </Router>
  );
}

export default App;