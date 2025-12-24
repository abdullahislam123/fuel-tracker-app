import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiLock, FiSave, FiAlertTriangle, FiTrash2, FiDownload, FiArrowLeft, FiDatabase } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]); // CSV export ke liye data
  const navigate = useNavigate();
  const API_URL = "https://fuel-tracker-api.vercel.app";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData({ username: user.username || "", email: user.email || "", password: "" });
      fetchEntries(); // Entries fetch karein taake export tayyar rahe
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchEntries = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/history`, { headers: { 'Authorization': token } });
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  const exportToCSV = () => {
    if (entries.length === 0) return alert("No fuel data found to export.");
    const headers = ["Date,Time,Liters,Rate,Total Cost,Odometer\n"];
    const rows = entries.map(item => `${item.date},${item.time || "-"},${item.liters},${item.pricePerLiter},${item.cost},${item.odometer || "-"}\n`);
    const blob = new Blob([headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fuel_Log_Backup.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        localStorage.clear();
        alert("Profile Updated! Please Login again.");
        navigate("/login");
      }
    } catch (error) { alert("Update failed"); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("PERMANENT DELETE? All fuel records will be lost.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/profile`, { method: 'DELETE', headers: { 'Authorization': token } });
      if (res.ok) { localStorage.clear(); navigate('/login'); }
    } catch (error) { alert("Error deleting account"); }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-fade-in">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm text-slate-500">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage your account and data</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* --- PROFILE SECTION --- */}
        <section className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-neutral-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <FiUser className="text-emerald-500" /> Personal Information
          </h3>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username</label>
              <FiUser className="absolute left-4 top-11 text-slate-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                // ⭐ FIX: border add kiya, outline-none lagaya, aur focus color set kiya
                className="w-full p-4 pl-12 bg-slate-50 dark:bg-neutral-800 border-2 border-transparent focus:border-emerald-500 outline-none rounded-2xl dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
              <FiMail className="absolute left-4 top-11 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-4 pl-12 bg-slate-50 dark:bg-neutral-800 border-2 border-transparent focus:border-emerald-500 outline-none rounded-2xl dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">New Password (Optional)</label>
              <FiLock className="absolute left-4 top-11 text-slate-400" />
              <input
                type="password"
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-4 pl-12 bg-slate-50 dark:bg-neutral-800 border-2 border-transparent focus:border-emerald-500 outline-none rounded-2xl dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
              />
            </div>

            <button onClick={handleUpdate} disabled={loading} className="w-full mt-4 bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-[0.98]">
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </section>

        {/* --- DATA MANAGEMENT SECTION (Export Adjusted Here) --- */}
        <section className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-50 dark:border-neutral-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <FiDatabase className="text-blue-500" /> Data & Backup
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-black text-blue-900 dark:text-blue-300">Export Fuel History</p>
              <p className="text-xs text-blue-700 dark:text-blue-400/70">Download all your records in CSV format for Excel.</p>
            </div>
            <button onClick={exportToCSV} className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
              <FiDownload /> Download CSV
            </button>
          </div>
        </section>

        {/* --- DANGER ZONE --- */}
        <section className="bg-red-50 dark:bg-red-900/10 p-6 md:p-8 rounded-[2.5rem] border border-red-100 dark:border-red-900/20">
          <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
            <FiAlertTriangle size={24} />
            <h3 className="text-lg font-black uppercase tracking-tighter">Danger Zone</h3>
          </div>
          <p className="text-sm text-red-500 dark:text-red-400/60 mb-6 font-medium">Once you delete your account, there is no going back. All data will be wiped from our servers.</p>
          <button onClick={handleDeleteAccount} className="w-full py-4 bg-white dark:bg-neutral-900 text-red-600 border-red-600 border-2 dark:border-red-900/30 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all active:scale-[0.98]">
            Delete My Account Permanently
          </button>
        </section>
      </div>
    </div>
  );
};

export default Profile;