import React, { useState, useEffect } from "react";
import { FiDollarSign, FiDroplet, FiTrendingUp, FiClock, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("User");
    const navigate = useNavigate();

    const API_URL = "https://fuel-tracker-api.vercel.app";

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData?.username) setUsername(userData.username);

        const token = localStorage.getItem("token");
        fetch(`${API_URL}/history`, {
            headers: { 'Authorization': token }
        })
            .then(res => res.json())
            .then(data => {
                setEntries(Array.isArray(data) ? data : (data.data || []));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [navigate]);

    const totalSpent = entries.reduce((acc, item) => acc + parseFloat(item.totalCost || item.cost || 0), 0);
    const totalLiters = entries.reduce((acc, item) => acc + parseFloat(item.liters || item.fuelAmount || 0), 0);
    const avgPrice = totalLiters > 0 ? (totalSpent / totalLiters).toFixed(2) : 0;

    if (loading) return <div className="p-10 text-center text-emerald-500 font-bold">Loading your fuel stats...</div>;

    return (
        <div className="animate-fade-in">
            {/* --- HEADER (Fixed Visibility) --- */}
            <header className="mb-10">
                {/* ⭐ !text-slate-900 ka matlab hai "kuch bhi ho jaye isay black hi rehna hai" */}
                <h1 className="text-4xl font-bold !text-slate-900! dark:!text-white! transition-all">
                    Welcome back,
                </h1>
                <p className="text-5xl font-black !text-slate-900! dark:!text-white! capitalize mt-1">
                    <span className="text-emerald-500">{username}</span>! 👋
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                    Here's your fuel consumption overview.
                </p>
            </header>

            {/* --- SUMMARY CARDS (Contrast Adjusted) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Total Spent Card */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spent</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        Rs. {totalSpent.toLocaleString()}
                    </h2>
                    <div className="absolute top-6 right-6 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <FiDollarSign size={24} />
                    </div>
                </div>

                {/* Consumed Card */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumed</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {totalLiters.toFixed(2)} <span className="text-lg text-slate-400">L</span>
                    </h2>
                    <div className="absolute top-6 right-6 p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl">
                        <FiDroplet size={24} />
                    </div>
                </div>

                {/* Avg Rate Card */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl shadow-sm border border-slate-100 dark:border-neutral-800 relative overflow-hidden transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Rate</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        Rs. {avgPrice}
                    </h2>
                    <div className="absolute top-6 right-6 p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-2xl">
                        <FiTrendingUp size={24} />
                    </div>
                </div>
            </div>

            {/* --- RECENT ACTIVITY --- */}
            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-neutral-800 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <FiClock className="text-emerald-500" /> Recent Activity
                    </h3>
                </div>
                <div className="p-4 space-y-3">
                    {entries.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="bg-white dark:bg-neutral-800 p-3 rounded-xl text-emerald-500 shadow-sm">
                                    <FiCalendar size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white">{item.liters} Liters</p>
                                    <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className="font-black text-slate-900 dark:text-white">Rs. {item.cost}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;