import React, { useState, useEffect, useContext } from "react"; // ⭐ useContext import kiya
// FiLogOut, FiTrash2, FiAlertTriangle, FiSun, FiMoon icons import kiye
import { FiUser, FiMail, FiLock, FiSave, FiLogOut, FiTrash2, FiAlertTriangle, FiSun, FiMoon } from "react-icons/fi"; 
import { useNavigate } from "react-router-dom"; // useNavigate import kiya
import { ThemeContext } from '../App'; // ⭐ ThemeContext ko import kiya (Path adjust karein agar App.jsx upar ki directory mein nahi hai)

const Profile = () => {
    // ⭐ Context se theme state aur toggle function lein
    const { theme, toggleTheme } = useContext(ThemeContext);
    
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // useNavigate hook use kiya
  
  // ⚠️ IMPORTANT: Aapka Live Backend Link yahan hona chahiye
  const API_URL = "https://fuel-tracker-api.vercel.app"; 

  // Page load hote hi LocalStorage se purana data dikhao
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
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
        
        {/* ⭐ ADDED: 1. DARK MODE TOGGLE SECTION (TOP) */}
        <div className="bg-white p-5 mb-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="p-3 rounded-full text-yellow-500 bg-yellow-100 dark:bg-slate-700 dark:text-yellow-400">
                        {theme === 'dark' ? <FiMoon size={20} /> : <FiSun size={20} />}
                    </span>
                    <h3 className="text-md font-bold text-slate-800 dark:text-white">
                        {theme === 'dark' ? "Dark Mode is ON" : "Light Mode is ON"}
                    </h3>
                </div>
                
                {/* ⭐ TOGGLE SWITCH */}
                <button 
                    onClick={toggleTheme} 
                    className={`relative w-14 h-8 flex items-center rounded-full transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle Dark Mode"
                >
                    <span 
                        className={`block w-6 h-6 rounded-full bg-white shadow transform transition-transform duration-300 ${
                            theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
        </div>
        {/* --- END DARK MODE TOGGLE --- */}
        
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700"> {/* ⭐ dark mode classes added */}
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4 dark:border-slate-700"> {/* ⭐ dark mode classes added */}
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"> {/* ⭐ dark mode classes added */}
            <FiUser size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Edit Profile</h2> {/* ⭐ dark mode classes added */}
            <p className="text-slate-500 text-sm dark:text-gray-400">Update your account details</p> {/* ⭐ dark mode classes added */}
          </div>
        </div>

        <div className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-gray-200">New Username</label> {/* ⭐ dark mode classes added */}
            <div className="relative">
              <FiUser className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Enter new username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                // ⭐ dark mode classes added to input field
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-gray-200">New Email</label> {/* ⭐ dark mode classes added */}
            <div className="relative">
              <FiMail className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="email" 
                placeholder="Enter new email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                // ⭐ dark mode classes added to input field
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-gray-200">New Password</label> {/* ⭐ dark mode classes added */}
            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="password" 
                placeholder="Leave empty to keep current"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                // ⭐ dark mode classes added to input field
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-1 dark:text-gray-500">Only enter if you want to change it.</p> {/* ⭐ dark mode classes added */}
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
      <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm dark:bg-red-900/20 dark:border-red-800"> {/* ⭐ dark mode classes added */}
        <div className="flex items-center mb-4">
          <FiAlertTriangle className="text-red-500 mr-3" size={24} />
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h2> {/* ⭐ dark mode classes added */}
        </div>
        
        {/* ⭐ NEW STRONG WARNING ADDED HERE */}
        <p className="text-sm font-semibold text-red-800 mb-3 p-2 bg-red-100 rounded-lg border-l-4 border-red-500 dark:bg-red-900/40 dark:text-red-300 dark:border-red-600"> {/* ⭐ dark mode classes added */}
           ⚠️ ACCOUNT DELETION IS PERMANENT. Once deleted, your data cannot be recovered in any case.
        </p>
        
        <p className="text-sm text-red-600 mb-4 dark:text-red-500"> {/* ⭐ dark mode classes added */}
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