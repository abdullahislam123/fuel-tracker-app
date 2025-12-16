import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// Icons
import { FaGasPump } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi"; 
import { MdFingerprint } from "react-icons/md"; 

// ⭐ IMPORTANT IMPORT (Iske bina fingerprint nahi chalega)
import { startAuthentication } from '@simplewebauthn/browser';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);

  // API URL
  const API_URL = "https://fuel-tracker-api.vercel.app"; 

  // Page load hote hi LocalStorage se last email utha lo (User asani ke liye)
  useEffect(() => {
    const savedEmail = localStorage.getItem("lastEmail");
    if(savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        // Login Success
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("lastEmail", formData.email); // Email yaad rakho next time ke liye
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

  // --- ⭐ ASLI FINGERPRINT LOGIN LOGIC ---
  const handleBiometricLogin = async () => {
    // 1. Sabse pehle check karo ke Email likha hai ya nahi
    if (!formData.email) {
        alert("Please enter your email address first to verify fingerprint.");
        return;
    }

    setLoading(true);

    try {
        // Step 1: Backend se Challenge mango (Email bhej kar)
        const resp = await fetch(`${API_URL}/auth/login-challenge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email })
        });

        if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.error || "User not found");
        }

        const options = await resp.json();

        // Step 2: Browser Scanner Open Karo 🖐️
        const authResp = await startAuthentication(options);

        // Step 3: Scan result wapas Backend bhejo Verify karne
        const verificationResp = await fetch(`${API_URL}/auth/login-verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: formData.email, 
                body: authResp 
            })
        });

        const verificationJSON = await verificationResp.json();

        if (verificationJSON.verified) {
            // 🎉 SUCCESS! Token Save karo aur Login karwao
            localStorage.setItem("token", verificationJSON.token);
            localStorage.setItem("user", JSON.stringify({
                username: verificationJSON.username,
                email: verificationJSON.email,
                _id: verificationJSON.userId
            }));
            localStorage.setItem("lastEmail", formData.email);
            
            alert("Fingerprint Verified! Logging in...");
            window.location.href = "/";
        } else {
            alert("Fingerprint verification failed.");
        }

    } catch (error) {
        console.error(error);
        if (error.name === 'NotAllowedError') {
            alert("Request cancelled.");
        } else {
            alert(error.message || "Biometric Login Failed");
        }
    } finally {
        setLoading(false);
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
            value={formData.email} // Value bind ki taaki auto-fill dikhe
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
            {loading ? "Logging in..." : "Login with Password"}
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