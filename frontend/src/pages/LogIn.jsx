import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, ArrowRight, Wallet } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🟢 UPGRADED LOGIC: Debugging & Safety Checks added here
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("🚀 Attempting Login...");
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      console.log("✅ Server Response:", response.data);

      // 1. Safety Check: Did we get a token?
      if (!response.data.token) {
        throw new Error("Server Error: No Token received!");
      }

      // 2. Save Token & User (Force Stringify for safety)
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      console.log("💾 Token Saved:", localStorage.getItem("token"));
      
      // 3. Redirect
      navigate("/dashboard");

    } catch (err) {
      console.error("❌ Login Error:", err);
      setError(err.response?.data?.msg || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 YOUR ORIGINAL UI (Unchanged)
  return (
    <div className="min-h-screen flex bg-gray-50">
      
      {/* LEFT SIDE: Visual & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 to-slate-900 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-10 translate-y-10"></div>
        
        <div className="relative z-10 text-center">
          <div className="bg-white/10 p-4 rounded-2xl inline-block mb-6 backdrop-blur-sm">
            <Wallet size={48} className="text-green-400" />
          </div>
          <h1 className="text-5xl font-bold mb-6">Split Bills,<br/>Not Friendships.</h1>
          <p className="text-lg text-blue-200 max-w-md mx-auto">
            The easiest way to track shared expenses, settle debts, and keep your group finances in check.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <span className="animate-pulse">Signing in...</span>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;