import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiLock, FiSave, FiLogOut } from "react-icons/fi"; // FiLogOut Import kiya

const Profile = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Page load hote hi LocalStorage se purana data dikhao
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData({ 
        username: user.username || "", 
        email: "", 
        password: "" 
      });
    }
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch('http://localhost:5000/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile Updated! Please Login again.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT FUNCTION (New) ---
  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
        localStorage.clear();
        window.location.href = "/login";
    }
  };

  return (
    // mb-20 add kiya taake mobile menu k peeche content na chupay
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
    </div>
  );
};

export default Profile;