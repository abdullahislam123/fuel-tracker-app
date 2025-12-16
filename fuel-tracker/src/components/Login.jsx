import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// Icons
import { FaGasPump } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi"; 
// Fingerprint Icon
import { MdFingerprint } from "react-icons/md"; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);

  // ⭐ UPDATE: Page load hote hi Fingerprint prompt trigger karein (Conditions ke sath)
  useEffect(() => {
    // 1. Check karein ki user ne Profile se Biometric enable kiya hai ya nahi
    const isBioEnabled = localStorage.getItem("biometricEnabled") === "true";

    if (isBioEnabled) {
      // Thoda delay dete hain taaki component render ho jaye
      const timer = setTimeout(() => {
          handleBiometricLogin();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://fuel-tracker-api.vercel.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
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

  // --- FINGERPRINT LOGIN LOGIC ---
  const handleBiometricLogin = async () => {
    if (!window.PublicKeyCredential) {
      console.log("Biometrics not supported on this device.");
      return;
    }

    try {
        // Browser aksar bina User Click ke Prompt block kar deta hai.
        console.log("Attempting Biometric Login...");
        
        // Future Integration:
        // navigator.credentials.get(...) yahan aayega
        
    } catch (error) {
      console.error("Auto-Biometric blocked by browser (User gesture required).");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"> 
        
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
          
          {/* Password Field */}
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full p-3 border rounded-xl pr-10"
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600" 
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          
          {/* Standard Login Button */}
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* ⭐ FINGERPRINT BUTTON */}
          <button 
            onClick={handleBiometricLogin}
            className="w-full bg-white border border-gray-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex justify-center items-center gap-2"
          >
            <MdFingerprint size={26} className="text-emerald-500" /> 
            Use Fingerprint
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