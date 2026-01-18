import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// Icons
import { FaGasPump } from "react-icons/fa";
import { FiEye, FiEyeOff, FiMail, FiLock, FiCheckCircle } from "react-icons/fi"; 
// Central API Config
import { API_URL } from "../config"; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);

  // Email persistence logic
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
        // ⭐ Token aur User Details save karein
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
            username: data.user.username,
            email: data.user.email,
            _id: data.user.id
        }));
        localStorage.setItem("lastEmail", cleanEmail);
        
        // ⭐ UPDATED REDIRECT: Seedha Dashboard ke bajaye Selection Page par bhejein
        window.location.href = "/select-vehicle";
      } else {
        alert(data.error || "Invalid Credentials");
      }
    } catch (error) {
      alert("Server Error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-x-hidden">
      
      {/* Branding Side */}
      <div className="md:w-1/2 bg-linear-to-br from-emerald-500 to-slate-900 relative overflow-hidden flex items-center justify-center p-8 md:p-16 order-1 md:order-2 min-h-[35vh] md:min-h-screen">
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <FaGasPump size={400} className="text-white transform rotate-12 scale-150 md:scale-100" />
        </div>
        
        <div className="relative z-10 text-white max-w-md text-center md:text-left">
            <div className="hidden md:inline-block bg-white/20 p-3 rounded-2xl mb-6 backdrop-blur-md">
                <FaGasPump size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight italic">
                Fueling Your <br/> Financial Future.
            </h1>
            <p className="text-emerald-100 text-sm md:text-base mb-8 leading-relaxed font-medium italic">
                Track every drop, manage multiple vehicles, and stay ahead of your expenses.
            </p>
            
            <div className="hidden md:flex flex-col gap-3 text-sm font-bold text-emerald-50">
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Multi-Vehicle Support</div>
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Bike & Car Specific Analytics</div>
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Cloud Data Backup</div>
            </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 order-2 md:order-1">
        <div className="w-full max-w-sm mx-auto">
          <div className="md:hidden flex justify-center mb-6 text-emerald-500 font-black italic text-2xl">
            FuelTracker<span className="text-slate-900">.pro</span>
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome Back!</h2>
          <p className="text-slate-500 mb-8 text-sm font-medium italic">Login to manage your vehicles efficiently</p>
          
          <div className="space-y-5">
            <div>
                <label className="block text-slate-600 text-[10px] font-black uppercase mb-2 pl-1 tracking-widest italic">Email Address</label>
                <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="email" 
                        placeholder="name@example.com" 
                        value={formData.email}
                        className="w-full p-4 pl-12 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-slate-600 text-[10px] font-black uppercase mb-2 pl-1 tracking-widest italic">Password</label>
                <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="w-full p-4 pl-12 pr-12 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none"
                    >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                </div>
            </div>
            
            <button 
              onClick={handleLogin} 
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 mt-4 uppercase text-[10px] italic"
            >
              {loading ? "Verifying Garage..." : "Access Your Garage"}
            </button>
          </div>

          <p className="text-center mt-8 text-slate-500 text-sm font-medium italic">
            Don't have an account? <Link to="/register" className="text-emerald-600 font-black hover:underline ml-1">Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;