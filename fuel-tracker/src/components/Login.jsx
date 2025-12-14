import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGasPump } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6 text-slate-900">
          <FaGasPump size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Welcome Back!</h2>
        <p className="text-center text-slate-500 mb-6">Login to manage your fuel expenses</p>
        
        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          
          <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
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