import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// FaGasPump icon import kiya
import { FaGasPump } from "react-icons/fa";
// FiEye aur FiEyeOff icons import kiye
import { FiEye, FiEyeOff } from "react-icons/fi"; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 

  const handleLogin = async () => {
    try {
      const res = await fetch('https://fuel-tracker-api.vercel.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        // --- TOKEN SAVE KARO ---
        localStorage.setItem("token", data.token); // ID Card Save
        localStorage.setItem("user", JSON.stringify(data)); // User details Save
        
        // Page Refresh taake App.jsx ko pata chale ke login ho gaya
        window.location.href = "/"; 
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Server Error");
    }
  };

  return (
    // ⭐ Register se Match: bg-slate-50
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* ⭐ Register se Match: border border-gray-100 */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"> 
        
        {/* ⭐ Register se Match: text-emerald-500 */}
        <div className="flex justify-center mb-6 text-emerald-500">
          <FaGasPump size={40} />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Welcome Back!</h2>
        <p className="text-center text-slate-500 mb-6">Login to manage your fuel expenses</p>
        
        <div className="space-y-4">
          {/* Email Field */}
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          
          {/* ⭐ PASSWORD FIELD WITH ICON (Register se Matched) */}
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full p-3 border rounded-xl pr-10"
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
            {/* Eye Icon Button */}
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              // Register se Match: hover:text-emerald-600
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600" 
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          
          <button 
            onClick={handleLogin} 
            // ⭐ Register se Match: bg-emerald-500
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            Login
          </button>
        </div>

        <p className="text-center mt-6 text-slate-500">
          Don't have an account? <Link to="/register" className="text-emerald-500 font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;