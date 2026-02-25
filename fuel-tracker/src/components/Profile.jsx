import React, { useState, useEffect, useContext } from "react";
import { FiUser, FiMail, FiLock, FiTrash2, FiSave, FiArrowLeft, FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { logout, updateUser } = useContext(AuthContext);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setUser(data.user);
        alert("Profile Updated");
      }
    } catch (err) { alert("Update failed"); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete account and all data?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if (res.ok) {
        logout();
        navigate("/login");
      }
    } catch (err) { alert("Deletion failed"); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0c10] pb-20 animate-fade-in px-4">
      <header className="pt-10 mb-12 max-w-2xl mx-auto flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-4 bg-slate-100 dark:bg-neutral-900 rounded-3xl text-slate-900 dark:text-white active:scale-95 transition-all">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black italic tracking-tighter dark:text-white">Profile<span className="text-emerald-500">.</span></h1>
        <div className="w-12" />
      </header>

      <main className="max-w-2xl mx-auto space-y-10">
        <div className="text-center mb-16">
          <div className="w-32 h-32 bg-emerald-500 text-slate-900 rounded-[3rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-transform">
            <FiUser size={64} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{user.username}</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic mt-2">Personal Settings</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="glass-card p-6 flex items-center gap-6 group">
            <div className="p-4 bg-slate-100 dark:bg-neutral-900 rounded-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">
              <FiUser size={24} />
            </div>
            <div className="flex-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic block mb-1">Full Name</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-transparent outline-none dark:text-white font-black italic tracking-widest text-lg"
              />
            </div>
          </div>

          <div className="glass-card p-6 flex items-center gap-6 group">
            <div className="p-4 bg-slate-100 dark:bg-neutral-900 rounded-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">
              <FiMail size={24} />
            </div>
            <div className="flex-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic block mb-1">Email Address</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent outline-none dark:text-white font-black italic tracking-widest text-lg"
              />
            </div>
          </div>

          <div className="glass-card p-6 flex items-center gap-6 group">
            <div className="p-4 bg-slate-100 dark:bg-neutral-900 rounded-2xl text-slate-400 group-hover:text-emerald-500 transition-colors">
              <FiLock size={24} />
            </div>
            <div className="flex-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic block mb-1">Password (Leave blank to keep current)</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                className="w-full bg-transparent outline-none dark:text-white font-black italic tracking-widest text-lg"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-8 bg-emerald-500 text-slate-900 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] shadow-2xl active:scale-95 hover:scale-[1.01] transition-all flex items-center justify-center gap-4"
          >
            {loading ? "Syncing..." : <>Save Changes <FiSave size={24} /></>}
          </button>
        </form>

        <div className="pt-10 border-t dark:border-white/5">
          <button
            onClick={handleDelete}
            className="w-full py-8 bg-red-500/10 text-red-500 border-2 border-dashed border-red-500/20 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-4"
          >
            Delete Account & Data <FiTrash2 size={24} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;