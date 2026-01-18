import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiLock, FiSave, FiAlertTriangle, FiTrash2, FiDownload, FiArrowLeft, FiDatabase, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; 

const Profile = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]); 
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData({ username: user.username || "", email: user.email || "", password: "" });
      fetchEntries(); 
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchEntries = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/history`, { headers: { 'Authorization': token } });
      const data = await res.json();
      const dataArray = Array.isArray(data) ? data : (data.data || []);
      setEntries(dataArray);
    } catch (err) { console.error("Fetch error:", err); }
  };

  const exportToCSV = () => {
    if (entries.length === 0) return alert("No fuel data found to export.");
    
    // ⭐ Updated Headers to include Odometer
    const headers = ["Date,Time,Liters,Rate,Total Cost,Odometer\n"];
    const rows = entries.map(item => `${item.date},${item.time || "-"},${item.liters},${item.pricePerLiter},${item.cost},${item.odometer || "-"}\n`);
    
    const blob = new Blob([headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fuel_Log_Backup_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUpdate = async () => {
  // 1. Validation: Khali data bhejne se rokein
  if (!formData.username || !formData.email) {
    return alert("Username and Email are required!");
  }

  setLoading(true);
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` // Standard Bearer format use karein
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email.toLowerCase().trim(),
        password: formData.password // Agar naya password hai toh jayega, warna backend ignore karega
      })
    });

    const data = await res.json();

    if (res.ok) {
      // 2. ⭐ LocalStorage Sync: Naya data save karein taake Dashboard refresh na karna pare
      // Hum purana token wahi rakhenge, bas user details badlenge
      const updatedUser = {
        id: data.user.id || data.user._id,
        username: data.user.username,
        email: data.user.email
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("✨ Success: Profile Updated!");
      
      // 3. Dashboard par bhejein taake user naya naam dekh sakay
      navigate("/dashboard"); 
    } else {
      // Backend se aane wala specific error dikhayein
      alert(data.error || "Update failed. Please try again.");
    }
  } catch (error) {
    console.error("Update Error:", error);
    alert("Server connection error. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  const handleDeleteAccount = async () => {
    if (!window.confirm("CRITICAL: Are you sure? All fuel logs and maintenance history will be deleted forever.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/profile`, { method: 'DELETE', headers: { 'Authorization': token } });
      if (res.ok) { 
        localStorage.clear(); 
        alert("Account Deleted Successfully.");
        navigate('/login'); 
      }
    } catch (error) { alert("Error deleting account"); }
  };

  const inputClass = "w-full p-4 pl-12 bg-slate-50 dark:bg-neutral-800 border-2 border-transparent focus:border-emerald-500 outline-none rounded-[1.5rem] dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold italic";

  return (
    <div className="max-w-3xl mx-auto pb-32 animate-fade-in px-4">
      {/* --- HEADER --- */}
      <header className="flex items-center gap-4 mb-10 pt-8">
        <button onClick={() => navigate(-1)} className="p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border dark:border-neutral-800 active:scale-90 transition-transform">
          <FiArrowLeft size={20} className="text-emerald-500" />
        </button>
        <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">App <span className="text-emerald-500">Settings</span></h2>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Security & Data Management</p>
        </div>
      </header>

      <div className="space-y-8">
        {/* --- PROFILE SECTION --- */}
        <section className="bg-white dark:bg-neutral-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 dark:border-neutral-800 relative overflow-hidden">
          <FiUser className="absolute -right-10 -top-10 text-emerald-500 opacity-[0.03]" size={250} />
          
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <FiShield className="text-emerald-500" /> Account Security
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Username</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Change Password (Optional)</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" />
                <input
                  type={showPassword ? "text" : "password"} 
                  placeholder="Leave blank to keep current"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none z-10"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button onClick={handleUpdate} disabled={loading} className="w-full mt-4 bg-emerald-500 text-white py-5 rounded-4xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98] uppercase tracking-widest text-xs">
              {loading ? "PROCESSING..." : "Update Credentials"}
            </button>
          </div>
        </section>

        {/* --- DATA MANAGEMENT --- */}
        <section className="bg-white dark:bg-neutral-900 p-8 rounded-[3rem] border border-slate-50 dark:border-neutral-800 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <FiDatabase className="text-blue-500" /> Local Backup
          </h3>
          <div className="bg-blue-500/5 p-6 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-500/10">
            <div>
              <p className="font-black text-slate-800 dark:text-blue-100 italic">Export Cloud Data</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Includes all Refills & Odometer logs</p>
            </div>
            <button onClick={exportToCSV} className="w-full md:w-auto px-10 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg">
              <FiDownload size={18}/> GET .CSV FILE
            </button>
          </div>
        </section>

        {/* --- DANGER ZONE --- */}
        <section className="bg-red-50 dark:bg-red-900/5 p-8 rounded-[3rem] border border-red-100 dark:border-red-900/20 shadow-sm overflow-hidden relative">
          <div className="flex items-center gap-3 mb-6 text-red-600">
            <FiAlertTriangle size={24} />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Critical Danger Zone</h3>
          </div>
          <p className="text-xs text-red-500/80 mb-8 font-bold leading-relaxed italic">Deleting your account will wipe your fuel efficiency chart, maintenance countdowns, and all recorded transactions from our database. This cannot be undone.</p>
          <button onClick={handleDeleteAccount} className="w-full py-5 bg-white dark:bg-neutral-900 text-red-600 border-red-200 border-2 dark:border-red-900/30 rounded-4xl font-black hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] uppercase tracking-widest text-[10px]">
            Delete My Account Permanently
          </button>
        </section>
      </div>
    </div>
  );
};

export default Profile;