import React, { useState, useEffect } from "react"; 
import { FiUser, FiMail, FiLock, FiSave, FiAlertTriangle } from "react-icons/fi"; 
import { MdFingerprint } from "react-icons/md"; 
import { useNavigate } from "react-router-dom"; 

// ⭐ NEW: Browser ki WebAuthn Library Import
import { startRegistration } from '@simplewebauthn/browser';

const Profile = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  
  // ⭐ Biometric State
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [bioLoading, setBioLoading] = useState(false); // Loading state for toggle
  
  const navigate = useNavigate(); 
  const API_URL = "https://fuel-tracker-api.vercel.app"; 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Check setting
    const isBioEnabled = localStorage.getItem("biometricEnabled") === "true";
    setBiometricEnabled(isBioEnabled);

    if (user) {
      setFormData({ 
        username: user.username || "", 
        email: user.email || "", 
        password: "" 
      });
    } else {
        navigate("/login");
    }
  }, [navigate]);

  // ⭐ REAL FINGERPRINT REGISTRATION LOGIC
  const toggleBiometric = async () => {
    // Agar pehle se ON hai, to OFF kar do (Simple)
    if (biometricEnabled) {
        setBiometricEnabled(false);
        localStorage.setItem("biometricEnabled", "false");
        alert("Biometric Login Disabled.");
        return;
    }

    // Agar OFF hai, to REGISTER karna padega (Complex)
    setBioLoading(true);
    const token = localStorage.getItem("token");

    try {
        // Step 1: Backend se Challenge mango
        const resp = await fetch(`${API_URL}/auth/register-challenge`, {
            headers: { 'Authorization': token }
        });
        
        if (!resp.ok) throw new Error("Failed to get challenge");
        const options = await resp.json();

        // Step 2: Browser ka Scanner Open karo (Magic happens here ✨)
        const attResp = await startRegistration(options);

        // Step 3: Result wapas Backend ko bhejo Verify karne ke liye
        const verificationResp = await fetch(`${API_URL}/auth/register-verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(attResp),
        });

        const verificationJSON = await verificationResp.json();

        if (verificationJSON.verified && verificationResp.ok) {
            // SUCCESS!
            setBiometricEnabled(true);
            localStorage.setItem("biometricEnabled", "true");
            alert("Fingerprint Registered Successfully! 🎉");
        } else {
            alert("Verification Failed. Try again.");
            setBiometricEnabled(false);
        }

    } catch (error) {
        console.error(error);
        // Agar user cancel kar de ya error aye
        if (error.name === 'NotAllowedError') {
            alert("You cancelled the fingerprint scan.");
        } else {
            alert("Biometric Registration Failed not allowed or supported.");
        }
        setBiometricEnabled(false);
    } finally {
        setBioLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const dataToSend = {};
      if (formData.username) dataToSend.username = formData.username;
      if (formData.email) dataToSend.email = formData.email;
      if (formData.password) dataToSend.password = formData.password;

      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token 
        },
        body: JSON.stringify(dataToSend) 
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.clear();
        alert("Profile Updated! Please Login again.");
        navigate("/login");
      } else {
        alert(data.error || "Update failed.");
      }
    } catch (error) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if(!window.confirm("Permanent Delete?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        localStorage.clear();
        navigate('/login');
      }
    } catch (error) { alert("Error deleting account"); }
  };

  return (
    <div className="max-w-md mx-auto mt-4 md:mt-10 mb-24"> 
        
        {/* ⭐ SETTINGS CARD */}
        <div className="bg-white p-5 mb-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Security Settings</h2>

            {/* --- BIOMETRIC TOGGLE --- */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className={`p-3 rounded-full ${biometricEnabled ? 'text-emerald-600 bg-emerald-100' : 'text-gray-500 bg-gray-100'}`}>
                        <MdFingerprint size={20} />
                    </span>
                    <div>
                        <h3 className="text-md font-bold text-slate-800">Biometric Login</h3>
                        <p className="text-xs text-slate-500">
                            {bioLoading ? "Waiting for scan..." : "Enable fingerprint access"}
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={toggleBiometric} 
                    disabled={bioLoading}
                    className={`relative w-12 h-7 flex items-center rounded-full transition-colors duration-300 ${
                        biometricEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                    } ${bioLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span 
                        className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-300 ${
                            biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
        </div>
        
      {/* ... (Baaki Profile Form Code same rahega as previous) ... */}
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"> 
            <FiUser size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
            <p className="text-slate-500 text-sm">Update your account details</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">New Username</label> 
            <div className="relative">
              <FiUser className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Enter new username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">New Email</label> 
            <div className="relative">
              <FiMail className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="email" 
                placeholder="Enter new email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label> 
            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="password" 
                placeholder="Leave empty to keep current"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-1">Only enter if you want to change it.</p>
          </div>

          {/* Update Button */}
          <button 
            onClick={handleUpdate} 
            disabled={loading}
            className="w-full mt-4 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2"
          >
            <FiSave /> {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* --- DANGER ZONE (Delete Account) --- */}
      <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm"> 
        <div className="flex items-center mb-4">
          <FiAlertTriangle className="text-red-500 mr-3" size={24} />
          <h2 className="text-lg font-bold text-red-700">Danger Zone</h2> 
        </div>
        
        <p className="text-sm font-semibold text-red-800 mb-3 p-2 bg-red-100 rounded-lg border-l-4 border-red-500"> 
            ⚠️ ACCOUNT DELETION IS PERMANENT. Once deleted, your data cannot be recovered in any case.
        </p>
        
        <p className="text-sm text-red-600 mb-4"> 
          Deleting your account will permanently erase your profile and all your saved fuel entries from our servers.
        </p>
        <button 
          onClick={handleDeleteAccount}
          className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
        >
          <FiTrash2 className="mr-2" /> Delete Account Permanently
        </button>
      </div>

    </div>
  );
};

export default Profile;