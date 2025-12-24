import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Icons
import { FaGasPump } from "react-icons/fa";
import { FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
// ⭐ SMART IMPORT: Central file se URL utha raha hai
import { API_URL } from "../config"; 

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 

  const handleRegister = async () => {
    if(!formData.username || !formData.email || !formData.password) {
        alert("Please fill all fields");
        return;
    }

    setLoading(true);
    try {
      // ⭐ UPDATED: Ab ye variable manual change karne ki zaroorat nahi
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registration Successful! Please Login.");
        navigate("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      alert("Server connection failed. Please try later.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-x-hidden">
      
      {/* --- RIGHT SIDE: Branding --- */}
      <div className="md:w-1/2 bg-linear-to-br from-emerald-500 to-slate-900 relative overflow-hidden flex items-center justify-center p-8 md:p-16 order-1 md:order-2 min-h-[35vh] md:min-h-screen animate-fade-in">
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <FaGasPump size={400} className="text-white transform -rotate-12 scale-150 md:scale-100" />
        </div>
        
        <div className="relative z-10 text-white flex flex-col items-start max-w-md animate-slide-up">
            <div className="bg-white/20 p-3 rounded-2xl mb-6 backdrop-blur-md">
                <FaGasPump size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                Start Your <br/> Fuel Journey.
            </h1>
            <p className="text-emerald-100 text-sm md:text-base mb-8 leading-relaxed font-medium">
                Join thousands of smart drivers tracking expenses, optimizing routes, and saving money every mile.
            </p>
            
            <div className="hidden md:flex flex-col gap-3 text-sm font-bold text-emerald-50">
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Smart Analytics Dashboard</div>
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Secure Cloud Sync</div>
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Export Reports Anytime</div>
            </div>
        </div>
      </div>

      {/* --- LEFT SIDE: Form --- */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 order-2 md:order-1 animate-fade-in">
        <div className="w-full max-w-sm mx-auto">
          
          <div className="md:hidden flex justify-center mb-6 text-emerald-500">
            <FaGasPump size={40} />
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-8 text-sm font-medium">Sign up to get started with FuelTracker</p>
          
          <div className="space-y-5">
            {/* Username Field */}
            <div>
                <label className="block text-slate-600 text-xs font-black uppercase mb-2 pl-1 tracking-widest">Username</label>
                <input 
                type="text" 
                placeholder="e.g., AliKhan123" 
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                />
            </div>
            
            {/* Email Field */}
            <div>
                <label className="block text-slate-600 text-xs font-black uppercase mb-2 pl-1 tracking-widest">Email Address</label>
                <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
            </div>
            
            {/* Password Field */}
            <div>
                <label className="block text-slate-600 text-xs font-black uppercase mb-2 pl-1 tracking-widest">Password</label>
                <div className="relative group">
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl pr-12 outline-none transition-all font-bold text-slate-700 shadow-sm"
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors p-1 focus:outline-none"
                >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
                </div>
            </div>
            
            <button 
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 mt-4 uppercase text-xs"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <p className="text-center mt-8 text-slate-500 text-sm font-medium">
            Already have an account? <Link to="/login" className="text-emerald-600 font-black hover:underline ml-1">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;