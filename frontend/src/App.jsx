import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages
import Login from './pages/LogIn'; 
import SignUp from './pages/SignUp'; 
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails'; 
import JoinGroup from './pages/JoinGroup'; // <--- 1. NEW IMPORT

// 🛡️ Helper 1: PROTECTED ROUTE (For Dashboard, Features)
// If NOT logged in -> Go to Login.
// If logged in -> Show the page.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// 🛡️ Helper 2: PUBLIC ROUTE (For Login & Signup)
// If ALREADY logged in -> Go to Dashboard.
// If NOT logged in -> Show the page.
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- AUTHENTICATION ROUTES (Wrapped in PublicRoute) --- */}
        
        {/* 1. The Home Page ("/") is LOGIN */}
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        {/* 2. The Signup Page */}
        <Route path="/signup" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />

        {/* --- MAIN APP ROUTES (Wrapped in ProtectedRoute) --- */}
        
        {/* 3. Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* 4. Feature Routes */}
        <Route path="/add-expense" element={
          <ProtectedRoute>
            <AddExpense />
          </ProtectedRoute>
        } />
        
        <Route path="/create-group" element={
          <ProtectedRoute>
            <CreateGroup />
          </ProtectedRoute>
        } />
        
        {/* 5. Group Details */}
        <Route path="/group/:groupId" element={
          <ProtectedRoute>
            <GroupDetails />
          </ProtectedRoute>
        } />

        {/* 6. JOIN GROUP VIA LINK (New Route) */}
        <Route path="/join/:groupId" element={
          <ProtectedRoute>
            <JoinGroup />
          </ProtectedRoute>
        } />

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


