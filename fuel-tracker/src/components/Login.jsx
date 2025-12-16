import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// Icons
import { FaGasPump } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi"; 
import { MdFingerprint } from "react-icons/md"; 

// ⭐ IMPORTANT IMPORT
import { startAuthentication } from '@simplewebauthn/browser';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);

  const API_URL = "https://fuel-tracker-api.vercel.app"; 

  // ⭐ MAGIC EFFECT: Page load hote hi check karo aur Scanner kholo
  useEffect(() => {
    // 1. Check karo user ne pehle login kiya tha ya nahi
    const savedEmail = localStorage.getItem("lastEmail");
    const isBioEnabled = localStorage.getItem("biometricEnabled") === "true";

    if (savedEmail) {
        // UI mein email dikhao
        setFormData(prev => ({ ...prev, email: savedEmail }));

        // 2. Agar Biometric ON hai, to khud ba khud button daba do!
        if (isBioEnabled) {
            console.log("Auto-triggering Biometric Login...");
            // Thoda sa delay taaki UI render ho jaye
            setTimeout(() => {
                handleBiometricLogin(savedEmail);
            }, 500);
        }
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Email clean karo
      const cleanEmail = formData.email.toLowerCase().trim();

      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: cleanEmail })
      });

      const data = await res.json();
      if (res.ok) {
        loginSuccess(data, cleanEmail);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // --- ⭐ FINGERPRINT LOGIN LOGIC (Modified to accept email directly) ---
  const handleBiometricLogin = async (autoEmail = null) => {
    // Agar auto-trigger hua hai to 'autoEmail' use karo, warna state se lo
    const emailToUse = autoEmail || formData.email;

    if (!emailToUse) {
        alert("Please enter your email address first.");
        return;
    }

    // Email ko clean (lowercase) karo taaki match ho jaye
    const cleanEmail = emailToUse.toLowerCase().trim();

    setLoading(true);

    try {
        // Step 1: Challenge
        const resp = await fetch(`${API_URL}/auth/login-challenge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail })
        });

        if (!resp.ok) {
            const err = await resp.json();
            // Agar auto-login fail ho (maslan user ne disable kar diya ho), to chup chap raho, alert mat do
            if (!autoEmail) alert(err.error || "User not found");
            setLoading(false);
            return;
        }

        const options = await resp.json();

        // Step 2: Browser Scanner Open Karo 🖐️
        const authResp = await startAuthentication(options);

        // Step 3: Verify
        const verificationResp = await fetch(`${API_URL}/auth/login-verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: cleanEmail, 
                body: authResp 
            })
        });

        const verificationJSON = await verificationResp.json();

        if (verificationJSON.verified) {
            loginSuccess(verificationJSON, cleanEmail);
        } else {
            alert("Fingerprint verification failed.");
        }

    } catch (error) {
        console.error(error);
        // Agar user ne 'Cancel' kiya to kuch mat bolo
        if (error.name !== 'NotAllowedError') {
             // alert(error.message); // Optional: Debugging ke liye on rakh sakte hain
        }
    } finally {
        setLoading(false);
    }
  };

  // Common function for success
  const loginSuccess = (data, email) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
          username: data.username,
          email: data.email,
          _id: data.userId
      }));
      // Email aur Biometric Status yaad rakho next time ke liye
      localStorage.setItem("lastEmail", email);
      
      // Agar ye normal login tha, to check karo ke bio enabled hai ya nahi
      // (Taaki agli baar auto-prompt ho sake)
      if (localStorage.getItem("biometricEnabled") !== "true") {
          // Default OFF hi rehne do, user profile se ON karega
      }

      window.location.href = "/"; 
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
            value={formData.email} 
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
          
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            {loading ? "Logging in..." : "Login with Password"}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <button 
            onClick={() => handleBiometricLogin(null)}
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