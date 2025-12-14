import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGasPump } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const handleRegister = async () => {
    try {
      const res = await fetch('https://fuel-tracker-api.vercel.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Registration Successful! Please Login.");
        navigate("/login");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Server Error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6 text-emerald-500">
          <FaGasPump size={40} />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Create Account</h2>
        
        <div className="space-y-4">
          <input type="text" placeholder="Username" className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, username: e.target.value})} />
          <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          
          <button onClick={handleRegister} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30">
            Sign Up
          </button>
        </div>

        <p className="text-center mt-6 text-slate-500">
          Already have an account? <Link to="/login" className="text-emerald-500 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;