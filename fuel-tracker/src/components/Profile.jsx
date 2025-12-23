import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiLock, FiSave, FiAlertTriangle, FiTrash2, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; 

const Profile = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const API_URL = "https://fuel-tracker-api.vercel.app"; 

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
      if (formData.email) dataToSend.email = formData.email.toLowerCase().trim();
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

  const handleLogout = () => {
      localStorage.clear();
      navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if(!window.confirm("Permanent Delete? This cannot be undone.")) return;
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
    <div className="max-w-md mx-auto mt-4 md:mt-10 mb-24 px-4"> 
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-3 mb-8 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"> 
                <FiUser size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
                <p className="text-slate-500 text-sm">Update your account details</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Username</label> 
            <input 
               type="text" 
               value={formData.username}
               onChange={(e) => setFormData({...formData, username: e.target.value})}
               // ⭐ FIX: 'text-slate-800' (Dark Text) aur 'bg-white' add kiya
               className="w-full p-3 border border-gray-200 rounded-xl text-slate-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label> 
            <input 
               type="email" 
               value={formData.email} 
               onChange={(e) => setFormData({...formData, email: e.target.value})}
               // ⭐ FIX: Yahan bhi Dark Text
               className="w-full p-3 border border-gray-200 rounded-xl text-slate-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
             <input 
               type="password" 
               placeholder="Leave empty to keep current"
               value={formData.password}
               onChange={(e) => setFormData({...formData, password: e.target.value})}
               // ⭐ FIX: Yahan bhi Dark Text
               className="w-full p-3 border border-gray-200 rounded-xl text-slate-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
             />
          </div>

          <button 
            onClick={handleUpdate} 
            disabled={loading}
            className="w-full mt-4 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
          >
            <FiSave className="inline mr-2"/> {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm"> 
        <div className="flex items-center mb-4">
          <FiAlertTriangle className="text-red-500 mr-3" size={24} />
          <h2 className="text-lg font-bold text-red-700">Danger Zone</h2> 
        </div>
        <p className="text-sm text-red-600 mb-4">Deleting your account will permanently erase your profile and all your saved fuel entries.</p>
        <button 
          onClick={handleDeleteAccount}
          className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30"
        >
          <FiTrash2 className="mr-2" /> Delete Account Permanently
        </button>
      </div>

    </div>
  );
};

export default Profile;