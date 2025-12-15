import React, { useState, useEffect } from "react";
// FiLogOut aur FiTrash2 aur FiAlertTriangle import kiye
import { FiUser, FiMail, FiLock, FiSave, FiLogOut, FiTrash2, FiAlertTriangle } from "react-icons/fi"; 
import { useNavigate } from "react-router-dom"; // useNavigate import kiya

const Profile = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // useNavigate hook use kiya
  
  // ⚠️ IMPORTANT: Aapka Live Backend Link yahan hona chahiye
  const API_URL = "https://fuel-tracker-api.vercel.app"; 

  // Page load hote hi LocalStorage se purana data dikhao
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      // Email fetch karte waqt user ka original email daalna zaroori hai
      // Warna backend sirf empty string receive karega
      setFormData({ 
        username: user.username || "", 
        email: user.email || "", // Profile update ke liye email zaroori hai
        password: "" 
      });
    } else {
        // Agar user data na mile to login par bhej do
        navigate("/login");
    }
  }, [navigate]);

  const handleUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // Jab update kar rahe hain, to sirf wohi fields bhejo jo change ki hain
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
        body: JSON.stringify(dataToSend) // Update kiya: sirf changed data bhejo
      });

      const data = await res.json();

      if (res.ok) {
        // LocalStorage update karo aur Logout/Login par bhej do
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

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  // --- NEW: DELETE ACCOUNT FUNCTION ---
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "ARE YOU ABSOLUTELY SURE? This action is permanent. All your data will be immediately deleted from our servers, and there is no recovery option in any case."
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (res.ok) {
        localStorage.clear();
        alert("Account deleted successfully! You will now be redirected to the login page.");
        navigate('/login');
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete account.");
      }

    } catch (error) {
      console.error("Deletion Error:", error);
      alert("A server error occurred during deletion.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-4 md:mt-10 mb-24"> 
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
          {/* Username, Email, Password Fields remains the same */}
          
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
                value={formData.email} // User ka existing email yahan dikhega
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
        
        {/* ⭐ NEW STRONG WARNING ADDED HERE */}
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