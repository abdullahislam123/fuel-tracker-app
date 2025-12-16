import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGasPump } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi"; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);

  const API_URL = "https://fuel-tracker-api.vercel.app"; 

  // Page load hote hi LocalStorage se email utha lo
  useEffect(() => {
    const savedEmail = localStorage.getItem("lastEmail");
    if(savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const cleanEmail = formData.email.toLowerCase().trim();
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: cleanEmail })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
            username: data.username,
            email: data.email,
            _id: data.userId
        }));
        localStorage.setItem("lastEmail", cleanEmail);
        window.location.href = "/"; 
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md border border-gray-100"> 
        
        <div className="flex justify-center mb-5 sm:mb-6 text-emerald-500">
          <FaGasPump size={36} className="sm:w-10 sm:h-10" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-800 mb-1">Welcome Back!</h2>
        <p className="text-center text-slate-500 text-sm mb-6">Login to manage your fuel expenses</p>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email} 
            className="w-full p-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full p-3 pr-10 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600" 
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="text-center mt-6 text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="text-emerald-500 font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;