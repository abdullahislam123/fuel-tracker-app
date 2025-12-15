import React, { useState, useEffect, useContext } from "react"; 
import { FiDollarSign, FiDroplet, FiTrendingUp, FiClock, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// ⭐ Recharts components import karein
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// ⭐ ThemeContext import karein taake chart Dark Mode mein theek dikhe
import { ThemeContext } from '../App'; 

const Dashboard = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("User");
    const navigate = useNavigate();
    
    // ⭐ Dark Mode check karne ke liye context use karein
    const { theme } = useContext(ThemeContext);
    
    // Chart colors based on theme
    const chartTextColor = theme === 'dark' ? '#d1d5db' : '#4b5563'; // gray-300 or gray-700
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb'; // gray-700 or gray-200


    const API_URL = "https://fuel-tracker-api.vercel.app";

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData && userData.username) {
            setUsername(userData.username);
        }

        const token = localStorage.getItem("token");

        fetch(`${API_URL}/history`, {
            method: 'GET',
            headers: { 'Authorization': token }
        })
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                localStorage.clear();
                navigate('/login');
                return [];
            }
            return res.json();
        })
        .then(data => {
            let finalData = [];
            if (Array.isArray(data)) {
                finalData = data;
            } else if (data.data && Array.isArray(data.data)) {
                finalData = data.data; 
            } else if (data.entries && Array.isArray(data.entries)) {
                finalData = data.entries;
            }

            setEntries(finalData);
            setLoading(false);
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            setLoading(false);
        });
    }, [navigate]);

    // --- OPTIMIZED CALCULATIONS ---
    const totalSpent = entries.reduce((acc, item) => {
        const rawVal = item.totalCost || item.cost || item.price || item.amount || 0;
        return acc + parseFloat(rawVal); 
    }, 0);

    const totalLiters = entries.reduce((acc, item) => {
        const rawVal = item.liters || item.fuelAmount || item.quantity || item.litres || 0;
        return acc + parseFloat(rawVal);
    }, 0);

    const avgPrice = totalLiters > 0 ? (totalSpent / totalLiters).toFixed(2) : 0;
    
    // ⭐ NEW: MONTHLY SPENDING DATA PROCESSING
    const getMonthlyData = () => {
        const monthlyDataMap = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        entries.forEach(entry => {
            const cost = parseFloat(entry.totalCost || entry.cost || entry.price || entry.amount || 0);
            const date = new Date(entry.date || entry.createdAt);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            // Key: YYYY-MM
            const key = `${year}-${String(month + 1).padStart(2, '0')}`;
            const monthLabel = `${monthNames[month]} ${String(year).slice(2)}`;

            if (!monthlyDataMap[key]) {
                monthlyDataMap[key] = { name: monthLabel, spent: 0 };
            }
            monthlyDataMap[key].spent += cost;
        });

        // Map ko sort karein aur array mein convert karein
        const sortedKeys = Object.keys(monthlyDataMap).sort();
        // Sirf pichle 12 mahine ka data len
        const monthlyArray = sortedKeys.slice(-12).map(key => ({
            name: monthlyDataMap[key].name,
            spent: parseFloat(monthlyDataMap[key].spent.toFixed(0))
        }));

        return monthlyArray;
    };

    const monthlySpendingData = getMonthlyData();


    if (loading) return <div className="p-10 text-center text-emerald-500 font-bold animate-pulse">Loading Overview...</div>;

    return (
        <div>
            {/* --- HEADER --- */}
            <header className="mb-8">
                {/* ⭐ Dark Mode classes added to match Profile.jsx */}
                <h1 className="text-4xl font-bold text-slate-900 dark:text-gray-50">
                    Welcome back,
                </h1>
                <p className="text-5xl font-extrabold text-white dark:text-gray-50 capitalize leading-snug">
                    <span className="text-emerald-500 dark:text-emerald-400">{username}</span>! 👋
                </p>
                <p className="text-slate-500 text-sm mt-2 dark:text-gray-400">
                    Here's your fuel consumption overview.
                </p>
            </header>

            {/* --- SUMMARY CARDS --- (Dark Mode classes are already in place from previous step) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Card 1: Total Spent */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition hover:shadow-md dark:bg-neutral-800 dark:border-neutral-700">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-400">Total Spent</div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-2 dark:text-gray-50">
                            Rs. {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    <div className="absolute top-5 right-5 p-3 bg-emerald-50 text-emerald-500 rounded-xl dark:bg-emerald-900/40 dark:text-emerald-300">
                        <FiDollarSign size={24} />
                    </div>
                </div>
                
                {/* Card 2: Total Liters */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition hover:shadow-md dark:bg-neutral-800 dark:border-neutral-700">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-400">Consumed</div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-2 dark:text-gray-50">
                        {totalLiters.toFixed(2)} <span className="text-lg text-gray-400 font-medium">L</span>
                    </div>
                    <div className="absolute top-5 right-5 p-3 bg-blue-50 text-blue-500 rounded-xl dark:bg-blue-900/40 dark:text-blue-300">
                        <FiDroplet size={24} />
                    </div>
                </div>

                {/* Card 3: Avg Rate */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition hover:shadow-md dark:bg-neutral-800 dark:border-neutral-700">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-400">Avg Rate</div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-2 dark:text-gray-50">Rs. {avgPrice}</div>
                    <div className="absolute top-5 right-5 p-3 bg-orange-50 text-orange-500 rounded-xl dark:bg-orange-900/40 dark:text-orange-300">
                        <FiTrendingUp size={24} />
                    </div>
                </div>
            </div>
            
            {/* ⭐ NEW: MONTHLY SPENDING CHART */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10 dark:bg-neutral-800 dark:border-neutral-700">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center dark:border-neutral-700">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 dark:text-gray-50">
                        <FiDollarSign className="text-emerald-500"/> Monthly Spending Trend (Last 12 Months)
                    </h3>
                </div>
                
                <div className="p-4 h-80 w-full"> 
                    {monthlySpendingData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={monthlySpendingData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20, // Move chart slightly left to align XAxis better
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke={chartTextColor} tickLine={false} axisLine={{ stroke: gridColor }} />
                                <YAxis stroke={chartTextColor} tickLine={false} axisLine={false} domain={[0, 'auto']} tickFormatter={(value) => `Rs ${value.toLocaleString()}`} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: theme === 'dark' ? '#334155' : 'white', 
                                        borderColor: theme === 'dark' ? '#475569' : '#e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Spent']}
                                    labelStyle={{ color: chartTextColor }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="spent" 
                                    stroke="#10b981" // emerald-500
                                    strokeWidth={3} 
                                    dot={{ fill: '#10b981', r: 4 }} 
                                    activeDot={{ r: 6 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-center text-gray-400 dark:text-gray-500">
                            Add more fuel entries across different months to see the spending trend.
                        </div>
                    )}
                </div>
            </div>


            {/* --- RECENT ACTIVITY --- (Dark Mode classes are retained) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-neutral-800 dark:border-neutral-700">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center dark:border-neutral-700">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 dark:text-gray-50">
                        <FiClock className="text-emerald-500"/> Recent Activity
                    </h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Last 3 entries</span>
                </div>
                
                <div className="p-4">
                    {entries.length === 0 ? (
                        <p className="text-center text-gray-400 py-4 dark:text-gray-500">No data available yet.</p>
                    ) : (
                        entries.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 mb-2 bg-gray-50 rounded-xl hover:bg-emerald-50 transition dark:bg-neutral-700 dark:hover:bg-neutral-600">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg text-emerald-600 shadow-sm dark:bg-neutral-800">
                                        <FiCalendar size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-gray-100">
                                            {parseFloat(item.liters || item.fuelAmount || item.quantity || 0).toFixed(2)} Liters
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-400">
                                            {new Date(item.date || item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900 dark:text-gray-50">
                                        Rs. {parseFloat(item.totalCost || item.cost || item.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;