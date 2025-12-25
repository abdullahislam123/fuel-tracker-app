import React, { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiDollarSign, FiDroplet, FiTrendingUp, FiAlertTriangle, FiActivity, FiZap, FiEdit3, FiSettings, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; 

const Dashboard = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [manualOdoInput, setManualOdoInput] = useState("");
    const navigate = useNavigate();

    const [maintItems, setMaintItems] = useState({});
    const [currentOdometer, setCurrentOdometer] = useState(0);

    // --- 1. SAFE DATA FETCHING ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const fetchData = async () => {
            try {
                // Pehle History fetch karein taake dashboard khali na rahe
                const hRes = await fetch(`${API_URL}/history`, { headers: { 'Authorization': token } });
                const hData = await hRes.json();
                const sortedHistory = (Array.isArray(hData) ? hData : (hData.data || [])).sort((a, b) => new Date(a.date) - new Date(b.date));
                setEntries(sortedHistory);

                // Ab Maintenance fetch karein, agar ye fail ho toh bhi dashboard chalta rahe
                let maintData = null;
                try {
                    const mRes = await fetch(`${API_URL}/maintenance`, { headers: { 'Authorization': token } });
                    if (mRes.ok) maintData = await mRes.json();
                } catch (e) {
                    console.warn("Cloud Maintenance API not found, using LocalStorage.");
                }
                
                calculateSystemState(sortedHistory, maintData);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // --- 2. LOGIC ENGINE (With Safety Checks) ---
    const calculateSystemState = (history, dbMaint) => {
        const savedOdo = parseFloat(localStorage.getItem("manualOdo"));
        // Math.max for empty array returns -Infinity, humne 0 as default rakha hai
        const latestEntryOdo = history.length > 0 ? Math.max(...history.map(e => parseFloat(e.odometer || 0))) : 0;
        const currentOdo = Math.max(savedOdo || 0, latestEntryOdo) || 4873.8;
        setCurrentOdometer(currentOdo);

        const config = { 
            oil: { label: "Engine Oil", interval: 1000 }, 
            filter: { label: "Air Filter", interval: 3000 }, 
            chain: { label: "Chain Lube", interval: 500 }, 
            plug: { label: "Spark Plug", interval: 10000 } 
        };

        const updatedItems = {};
        Object.keys(config).forEach(key => {
            const lastService = dbMaint?.[`${key}_last_odo`] || parseFloat(localStorage.getItem(`last_${key}_odo`)) || 0;
            const driven = lastService > 0 ? (currentOdo - lastService) : 0;
            const remaining = config[key].interval - driven;
            const percent = Math.min((driven / config[key].interval) * 100, 100);

            updatedItems[key] = {
                label: config[key].label,
                remaining: remaining > 0 ? remaining.toFixed(1) : 0,
                percent: percent,
                critical: remaining <= 0
            };
        });

        setMaintItems(updatedItems);
        if (updatedItems.oil?.critical) setShowAlert(true);
    };

    // --- 3. ANALYTICS ---
    const stats = useMemo(() => {
        const totalSpent = entries.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
        const totalLiters = entries.reduce((acc, item) => acc + (parseFloat(item.liters) || 0), 0);
        const readings = entries.map(e => parseFloat(e.odometer)).filter(v => !isNaN(v) && v > 0);
        
        // Average Formula: (Max Odo - Min Odo) / Total Liters
        const fuelAvg = (totalLiters > 0 && readings.length > 1) 
            ? ((Math.max(...readings) - Math.min(...readings)) / totalLiters).toFixed(2) 
            : "0.00";

        return { totalSpent, totalLiters, fuelAvg };
    }, [entries]);

    const chartData = useMemo(() => entries.map((e, i) => {
        let eff = 0;
        if (i > 0) {
            const d = parseFloat(e.odometer) - parseFloat(entries[i-1].odometer);
            const l = parseFloat(e.liters);
            eff = (d > 0 && l > 0) ? (d / l).toFixed(1) : 0;
        }
        return {
            name: new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            Spent: parseFloat(e.cost) || 0,
            Efficiency: parseFloat(eff)
        };
    }).slice(-7), [entries]);

    if (loading) return <div className="p-20 text-center text-emerald-500 font-black animate-pulse tracking-widest uppercase">Syncing Analytics...</div>;

    return (
        <div className="animate-fade-in pb-24 px-4 max-w-7xl mx-auto italic font-bold">
            {/* ALERT */}
            {showAlert && (
                <div className="fixed inset-x-4 top-8 z-100 md:max-w-md md:mx-auto animate-bounce bg-red-600 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4 border-2 border-white/20">
                    <FiAlertTriangle size={32} />
                    <div className="flex-1">
                        <h4 className="text-[10px] uppercase font-black tracking-widest">Maintenance Alert</h4>
                        <p className="text-xs">Engine Oil Change is Required!</p>
                    </div>
                </div>
            )}

            <header className="mb-12 pt-8 flex justify-between items-center">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter">FuelTracker<span className="text-emerald-500">.pro</span></h1>
                <div className="bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 text-emerald-500 text-[10px] uppercase tracking-widest animate-pulse">● System Online</div>
            </header>

            {/* MAINTENANCE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {Object.keys(maintItems).length > 0 && Object.entries(maintItems).map(([key, item]) => (
                    <div key={key} className={`p-8 rounded-[3.5rem] border-2 transition-all shadow-xl ${item.critical ? 'bg-red-500/5 border-red-500/20' : 'bg-white dark:bg-neutral-900 border-slate-50 dark:border-neutral-800'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div className={`p-4 rounded-3xl ${item.critical ? 'bg-red-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}><FiSettings size={22}/></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">1000 KM Cycle</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <h2 className={`text-4xl font-black mt-2 italic tracking-tighter ${item.critical ? 'text-red-600' : 'dark:text-white'}`}>{item.remaining} <span className="text-sm opacity-40 uppercase">KM</span></h2>
                        <div className="mt-6 w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${item.percent > 85 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${item.percent}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN STATS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <div className="bg-emerald-500 p-10 rounded-[4rem] shadow-2xl shadow-emerald-500/30 text-white relative overflow-hidden group">
                    <FiZap className="absolute -right-5 -bottom-5 text-white/20 group-hover:scale-125 transition-transform duration-700" size={180} />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Avg Efficiency</p>
                    <h2 className="text-6xl font-black mt-4 italic tracking-tighter">{stats.fuelAvg} <span className="text-xl">KM/L</span></h2>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-[3rem] border dark:border-neutral-800 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spent</p>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2 italic">Rs.{stats.totalSpent.toLocaleString()}</h2>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-[3rem] border dark:border-neutral-800 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Liters</p>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2 italic">{stats.totalLiters.toFixed(1)}L</h2>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col justify-between">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-2"><FiEdit3/> Sync Odometer</p>
                   <input type="number" value={manualOdoInput} onChange={(e) => setManualOdoInput(e.target.value)} placeholder={currentOdometer} className="w-full p-5 bg-white/5 border-none rounded-3xl outline-none font-black text-white text-xl italic" />
                   <button onClick={() => { localStorage.setItem("manualOdo", manualOdoInput); window.location.reload(); }} className="w-full mt-4 bg-emerald-500 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all">Pulse Refresh</button>
                </div>
            </div>

            {/* CHART */}
            <div className="bg-white dark:bg-neutral-900 p-10 rounded-[4rem] border dark:border-neutral-800 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] mb-12 flex items-center gap-3"><FiTrendingUp className="text-emerald-500" /> Performance Analytics</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} dy={10} />
                            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.1)', fontStyle: 'italic' }} />
                            <Legend wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: '900' }} />
                            <Area yAxisId="left" type="monotone" dataKey="Spent" stroke="#10b981" strokeWidth={5} fill="url(#colorSpent)" name="Spent (Rs)" />
                            <Area yAxisId="right" type="monotone" dataKey="Efficiency" stroke="#3b82f6" strokeWidth={5} fill="url(#colorEff)" name="Avg KM/L" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;