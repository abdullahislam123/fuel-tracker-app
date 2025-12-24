import React, { useState, useEffect } from "react";
// Chart components
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Icons
import { FiDollarSign, FiDroplet, FiTrendingUp, FiClock, FiCalendar, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// ⭐ Central Config Import
import { API_URL } from "../config"; 

const Dashboard = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("User");
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData?.username) setUsername(userData.username);

        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        // ⭐ Updated to use Central API_URL
        fetch(`${API_URL}/history`, {
            headers: { 'Authorization': token }
        })
            .then(res => res.json())
            .then(data => {
                const dataArray = Array.isArray(data) ? data : (data.data || []);
                // Sorting: Chart ke liye purana data pehle, Recent activity ke liye naya baad mein handle karenge
                const sortedData = dataArray.sort((a, b) => new Date(a.date) - new Date(b.date));
                setEntries(sortedData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [navigate]);

    // --- CALCULATIONS ---
    const totalSpent = entries.reduce((acc, item) => acc + parseFloat(item.cost || 0), 0);
    const totalLiters = entries.reduce((acc, item) => acc + parseFloat(item.liters || 0), 0);
    const avgPrice = totalLiters > 0 ? (totalSpent / totalLiters).toFixed(2) : 0;

    // Chart Data: Last 7 days tracking
    const chartData = entries.slice(-7).map(entry => ({
        name: new Date(entry.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        amount: parseFloat(entry.cost)
    }));

    // --- SKELETON LOADING ---
    if (loading) return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 animate-pulse">
            <div className="space-y-3">
                <div className="h-10 w-48 bg-slate-200 dark:bg-neutral-800 rounded-2xl"></div>
                <div className="h-14 w-64 bg-slate-100 dark:bg-neutral-800/50 rounded-2xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-slate-50 dark:bg-neutral-900 rounded-[2.5rem] border border-slate-100 dark:border-neutral-800"></div>
                ))}
            </div>
            <div className="h-64 bg-slate-50 dark:bg-neutral-900 rounded-[3rem] border border-slate-100 dark:border-neutral-800"></div>
        </div>
    );

    return (
        <div className="animate-fade-in pb-20 px-2 md:px-0">
            {/* --- HEADER --- */}
            <header className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Welcome back,</h1>
                <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white capitalize mt-1">
                    <span className="text-emerald-500">{username}</span>! 👋
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 tracking-tight">Here's your fuel consumption overview.</p>
            </header>

            {/* --- SUMMARY CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden group transition-all hover:shadow-md">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spent</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Rs. {totalSpent.toLocaleString()}</h2>
                    <div className="absolute top-6 right-6 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl"><FiDollarSign size={24} /></div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden group transition-all hover:shadow-md">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumed</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{totalLiters.toFixed(2)} <span className="text-lg text-slate-400">L</span></h2>
                    <div className="absolute top-6 right-6 p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl"><FiDroplet size={24} /></div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden group transition-all hover:shadow-md">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Rate</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Rs. {avgPrice}</h2>
                    <div className="absolute top-6 right-6 p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-2xl"><FiTrendingUp size={24} /></div>
                </div>
            </div>

            {/* --- ANALYTICS CHART --- */}
            <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-neutral-800 mb-10">
                <h3 className="font-black text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                    <FiTrendingUp className="text-emerald-500" /> Spending Trend (Last 7 Refills)
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                            <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- RECENT ACTIVITY --- */}
            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-neutral-800 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2"><FiClock className="text-emerald-500" /> Recent Activity</h3>
                    <button onClick={() => navigate('/history')} className="text-xs font-black text-emerald-500 flex items-center gap-1 uppercase tracking-widest hover:gap-2 transition-all">
                        View All <FiArrowRight />
                    </button>
                </div>
                <div className="p-4 space-y-3">
                    {entries.length > 0 ? [...entries].reverse().slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-neutral-800/40 rounded-2xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-white dark:bg-neutral-800 p-3 rounded-xl text-emerald-500 shadow-sm border dark:border-neutral-700"><FiCalendar size={20} /></div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white">{item.liters} Liters</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(item.date).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                            <p className="font-black text-slate-900 dark:text-white">Rs. {item.cost}</p>
                        </div>
                    )) : (
                        <div className="py-10 text-center text-slate-400 font-bold text-sm italic tracking-widest uppercase">No entries yet. Start tracking!</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;