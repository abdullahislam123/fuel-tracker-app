import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// Icons
import { FaGasPump } from "react-icons/fa";
import { FiEye, FiEyeOff, FiMail, FiLock, FiCheckCircle } from "react-icons/fi"; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);

  // Ye code khud hi detect kar lega ke aap laptop par hain ya live
const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://fuel-tracker-api.vercel.app";

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
        window.location.href = "/dashboard"; // Redirect to dashboard
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
    // ⭐ MAIN CONTAINER: Split screen layout
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      
      {/* --- ⭐ RIGHT SIDE: Attractive Branding (Desktop Order-2) --- */}
      <div className="md:w-1/2 bg-linear-to-br from-emerald-500 to-slate-900 relative overflow-hidden flex items-center justify-center p-8 md:p-16 order-1 md:order-2 min-h-[30vh] md:min-h-screen">
        {/* Decorative Background Icon */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <FaGasPump size={400} className="text-white transform rotate-12 scale-150 md:scale-100" />
        </div>
        
        {/* Text Content */}
        <div className="relative z-10 text-white max-w-md text-center md:text-left">
            <div className="hidden md:inline-block bg-white/20 p-3 rounded-2xl mb-6 backdrop-blur-md">
                <FaGasPump size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                Fueling Your <br/> Financial Future.
            </h1>
            <p className="text-emerald-100 text-sm md:text-base mb-8 leading-relaxed font-medium">
                Log in to access your personalized dashboard, track every drop, and stay ahead of your expenses.
            </p>
            
            {/* Feature List (Desktop Only) */}
            <div className="hidden md:flex flex-col gap-3 text-sm font-bold text-emerald-50">
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Real-time Price Tracking</div>
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Mileage Analytics</div>
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-300" /> Cloud Data Backup</div>
            </div>
        </div>
      </div>

      {/* --- ⭐ LEFT SIDE: Login Form (Desktop Order-1) --- */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 order-2 md:order-1 animate-fade-in">
        <div className="w-full max-w-sm mx-auto">
          
          {/* Mobile Logo Only */}
          <div className="md:hidden flex justify-center mb-6 text-emerald-500">
            <FaGasPump size={40} />
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome Back!</h2>
          <p className="text-slate-500 mb-8 text-sm">Login to manage your fuel expenses efficiently</p>
          
          <div className="space-y-5">
            {/* Email Field */}
            <div>
                <label className="block text-slate-600 text-xs font-bold uppercase mb-2 pl-1">Email Address</label>
                <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="email" 
                        placeholder="name@example.com" 
                        value={formData.email}
                        className="w-full p-4 pl-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-700"
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                </div>
            </div>
            
            {/* Password Field */}
            <div>
                <label className="block text-slate-600 text-xs font-bold uppercase mb-2 pl-1">Password</label>
                <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="w-full p-4 pl-12 pr-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-700"
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                </div>
            </div>
            
            <button 
              onClick={handleLogin} 
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black tracking-wide hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {loading ? "Verifying..." : "Login to Dashboard"}
            </button>
          </div>

          <p className="text-center mt-8 text-slate-500 text-sm font-medium">
            Don't have an account? <Link to="/register" className="text-emerald-600 font-black hover:underline">Register now</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;