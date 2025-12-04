import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// Import your pages
import Login from './pages/LogIn';
import SignUp from './pages/SignUp'; 
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails'; // Kept this import from HEAD

function App() {
  return (
    <Router>
      <Routes>
        {/* --- AUTHENTICATION ROUTES --- */}
        {/* 1. The Home Page ("/") is LOGIN */}
        <Route path="/" element={<Login />} />
        
        {/* 2. The Signup Page */}
        <Route path="/signup" element={<SignUp />} />

        {/* --- MAIN APP ROUTES --- */}
        {/* 3. The Dashboard is moved to "/dashboard" */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 4. Feature Routes */}
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/create-group" element={<CreateGroup />} />
        
        {/* 5. Group Details (The "Vanishing" feature from HEAD) */}
        <Route path="/group/:groupId" element={<GroupDetails />} />
      </Routes>
    </Router>
  );
}

export default App;



// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// // Import your pages
// import Login from './pages/LogIn';
// import SignUp from './pages/SignUp'; 
// import Dashboard from './pages/Dashboard';
// import AddExpense from './pages/AddExpense';
// import CreateGroup from './pages/CreateGroup';
// <<<<<<< HEAD
// import GroupDetails from './pages/GroupDetails'; // <--- Import this
// =======
// >>>>>>> 23a527acada4074fc25b7d897049e06ccbbb50fb

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* --- CHANGE THIS SECTION --- */}
        
//         {/* 1. The Home Page ("/") must be LOGIN */}
//         <Route path="/" element={<Login />} />
        
//         {/* 2. The Signup Page */}
//         <Route path="/signup" element={<SignUp />} />

//         {/* 3. The Dashboard is moved to "/dashboard" */}
//         <Route path="/dashboard" element={<Dashboard />} />
        
//         {/* --------------------------- */}

//         <Route path="/add-expense" element={<AddExpense />} />
//         <Route path="/create-group" element={<CreateGroup />} />
// <<<<<<< HEAD
//         <Route path="/group/:groupId" element={<GroupDetails />} /> {/* <--- Add Route */}
// =======
// >>>>>>> 23a527acada4074fc25b7d897049e06ccbbb50fb
//       </Routes>
//     </Router>
//   );
// }

// export default App;


