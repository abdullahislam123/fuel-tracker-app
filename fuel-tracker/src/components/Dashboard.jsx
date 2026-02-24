import React, { useState, useEffect, useMemo } from "react";
import {
    FiAlertTriangle, FiDroplet, FiZap, FiActivity,
    FiPlus, FiChevronDown, FiShield, FiTrendingUp, FiCheckCircle, FiSettings, FiNavigation
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { VehicleContext } from "../context/VehicleContext";
import FuelCharts from "./FuelCharts";

const styles = {
    card: "glass-card p-10 hover:shadow-emerald-500/10 hover:border-emerald-500/50 transition-all duration-500 group flex flex-col justify-between h-full",
    statLabel: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-3 block italic",
    statValue: "text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic",
    iconContainer: "w-16 h-16 rounded-[2rem] flex items-center justify-center bg-emerald-500/10 text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-emerald-500/5"
};

const Dashboard = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(localStorage.getItem("activeVehicleId") || "");
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSpend: 0, totalLiters: 0, avgEconomy: 0 });
    const [maintenance, setMaintenance] = useState({ percentage: 0, status: 'Good', remaining: 0, limit: 0, currentOdo: 0 });
    const [manualOdoInput, setManualOdoInput] = useState("");

    const navigate = useNavigate();
    const { activeVehicle, setActiveVehicle } = React.useContext(VehicleContext);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        try {
            const vRes = await fetch(`${API_URL}/vehicles`, { headers: { 'Authorization': token } });

            if (vRes.status === 401 || vRes.status === 403) {
                localStorage.clear();
                navigate("/login");
                return;
            }

            const vData = await vRes.json();
            const vehiclesList = Array.isArray(vData) ? vData : [];
            setVehicles(vehiclesList);

            const activeId = selectedVehicleId || vehiclesList[0]?._id;
            if (activeId) {
                setSelectedVehicleId(activeId);
                localStorage.setItem("activeVehicleId", activeId);
                const currentVehicle = vehiclesList.find(v => v._id === activeId);
                setActiveVehicle(currentVehicle);

                const hRes = await fetch(`${API_URL}/history?vehicleId=${activeId}`, { headers: { 'Authorization': token } });
                const hData = await hRes.json();

                const historyList = Array.isArray(hData) ? hData : (hData.data && Array.isArray(hData.data) ? hData.data : []);
                const sortedHistory = historyList.sort((a, b) => new Date(b.date) - new Date(a.date));
                setEntries(sortedHistory);

                if (currentVehicle) {
                    calculateMaintenanceStatus(sortedHistory, currentVehicle);
                }
            }
        } catch (err) {
            console.error("System Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [selectedVehicleId]);

    const calculateMaintenanceStatus = (history, vehicle) => {
        if (!vehicle) return;

        const latestEntryOdo = history.length > 0 ? parseFloat(history[0].odometer || 0) : 0;
        const savedOdo = localStorage.getItem(`odo_${vehicle._id}`);
        const currentOdo = Math.max(parseFloat(savedOdo || 0), latestEntryOdo);

        const INTERVAL = vehicle.maintenanceInterval || (vehicle.type === 'Bike' ? 1000 : 5000);
        const lastService = vehicle.oilLastOdo || 0;

        const targetOdo = lastService + INTERVAL;
        const remaining = targetOdo - currentOdo;
        const drivenInCycle = currentOdo - lastService;

        const percentage = Math.min((drivenInCycle / INTERVAL) * 100, 100);
        const status = remaining <= 0 ? 'Overdue' : (remaining <= (INTERVAL * 0.1) ? 'Critical' : 'Good');

        const totalSpent = history.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
        const totalLiters = history.reduce((acc, item) => acc + (parseFloat(item.liters) || 0), 0);
        const readings = history.map(e => parseFloat(e.odometer)).filter(v => v > 0);
        const avgEconomy = (totalLiters > 0 && readings.length > 1)
            ? ((Math.max(...readings) - Math.min(...readings)) / totalLiters).toFixed(2) : "0.00";

        setStats({ totalSpend: totalSpent, totalLiters: totalLiters.toFixed(1), avgEconomy: avgEconomy });
        setMaintenance({
            percentage: Math.round(percentage),
            status: status,
            remaining: remaining > 0 ? remaining : 0,
            limit: targetOdo,
            currentOdo: currentOdo
        });
    };

    const handleResetMaintenance = async () => {
        const token = localStorage.getItem("token");
        const currentVehicle = vehicles.find(v => v._id === selectedVehicleId);
        const interval = currentVehicle?.maintenanceInterval || (currentVehicle?.type === 'Bike' ? 1000 : 5000);
        const nextTarget = Math.floor(maintenance.currentOdo + interval);

        if (window.confirm(`Did you change oil at ${maintenance.currentOdo} KM? Next target will be ${nextTarget} KM`)) {
            try {
                await fetch(`${API_URL}/maintenance/reset`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({ vehicleId: selectedVehicleId, currentOdo: maintenance.currentOdo })
                });
                localStorage.setItem(`odo_${selectedVehicleId}`, maintenance.currentOdo);
                fetchData();
            } catch (error) { console.error("Reset Failed"); }
        }
    };

    const handleSync = () => {
        if (!manualOdoInput) return;
        localStorage.setItem(`odo_${selectedVehicleId}`, manualOdoInput);
        setManualOdoInput("");
        fetchData();
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0c10]">
            <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-8" />
            <h2 className="text-xl font-black italic text-emerald-500 animate-pulse tracking-widest uppercase">Initializing Radar...</h2>
        </div>
    );

    return (
        <div className="relative pb-36 max-w-7xl mx-auto px-4 animate-fade-in">
            {/* --- PREMIUM HERO SECTION --- */}
            <header className="mb-12 pt-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div className="relative">
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.8] mb-4">
                        Dash<span className="text-emerald-500">Board</span>.
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em] italic bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> System Active: {activeVehicle?.name || 'Vitals'}
                        </p>
                    </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-center bg-slate-100 dark:bg-neutral-900/50 p-2 rounded-[2.5rem] border dark:border-white/5 backdrop-blur-md">
                    <div className="flex -space-x-2 px-4 py-2 border-r dark:border-white/5">
                        {vehicles.slice(0, 3).map((v, i) => (
                            <div key={v._id} title={v.name} className="w-10 h-10 rounded-full border-4 border-white dark:border-neutral-900 bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                                <FiActivity size={14} />
                            </div>
                        ))}
                    </div>
                    <select
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        className="bg-transparent outline-none font-black italic text-slate-900 dark:text-white px-6 py-2 cursor-pointer appearance-none text-sm tracking-widest uppercase"
                    >
                        {vehicles.map(v => <option key={v._id} value={v._id} className="dark:bg-[#12141c]">{v.name}</option>)}
                    </select>
                    <button onClick={() => navigate("/select-vehicle")} className="p-4 bg-emerald-500 text-white rounded-[1.8rem] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"><FiPlus size={20} /></button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* --- ANALYTICS HUB --- */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={styles.card}>
                        <div className="flex justify-between items-start">
                            <div className={styles.iconContainer}><FiActivity size={28} /></div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase italic tracking-tighter">Gross Spend</span>
                            </div>
                        </div>
                        <div className="mt-10">
                            <span className={styles.statLabel}>Consolidated Expenditure</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-emerald-500 italic">Rs.</span>
                                <h3 className={styles.statValue}>{stats.totalSpend.toLocaleString()}</h3>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-slate-400">
                                <span className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[65%]" />
                                </span>
                                <span className="text-[9px] font-black">+12.5%</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className="flex justify-between items-start">
                            <div className={styles.iconContainer}><FiDroplet size={28} /></div>
                            <div className="text-right"><span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase italic tracking-tighter">Total Volume</span></div>
                        </div>
                        <div className="mt-10">
                            <span className={styles.statLabel}>Total Resource Consumption</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className={styles.statValue}>{stats.totalLiters}</h3>
                                <span className="text-2xl font-black text-blue-500 italic">Liters</span>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 mt-4 uppercase">Across {entries.length} refueling sessions</p>
                        </div>
                    </div>

                    <div className="md:col-span-2 glass-card p-12 relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><FiTrendingUp size={200} /></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                            <div>
                                <h4 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-4">
                                    {stats.avgEconomy} <span className="text-emerald-500 text-2xl tracking-normal">km/L</span>
                                </h4>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic">Current Resource Efficiency Index</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500"><FiTrendingUp size={30} /></div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 glass-card p-10 flex items-center justify-between gap-6 border-emerald-500/10 shadow-emerald-500/5">
                        <div className="flex-1">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 block italic flex items-center gap-2">
                                <FiZap className="animate-pulse" /> Sync Odometer
                            </span>
                            <input
                                type="number"
                                value={manualOdoInput}
                                onChange={(e) => setManualOdoInput(e.target.value)}
                                placeholder={maintenance.currentOdo.toFixed(0)}
                                className="w-full bg-slate-100 dark:bg-neutral-800/80 p-5 rounded-3xl font-black text-2xl text-emerald-500 outline-none border-2 border-transparent focus:border-emerald-500/30 transition-all italic"
                            />
                        </div>
                        <button
                            onClick={handleSync}
                            className="bg-emerald-500 text-white p-7 rounded-[2rem] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all hover:rotate-12"
                        >
                            <FiActivity size={28} />
                        </button>
                    </div>

                    {/* --- PRO TOOLS --- */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div
                            onClick={() => navigate("/trip-estimator")}
                            className="glass-card p-8 group/tool hover:bg-emerald-500 transition-all duration-500 cursor-pointer border border-emerald-500/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-emerald-500/10 text-emerald-500 group-hover/tool:bg-white group-hover/tool:text-emerald-500 rounded-2xl transition-all">
                                    <FiNavigation size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/tool:text-emerald-100 block italic">Smart Tool</span>
                                    <h4 className="text-xl font-black italic tracking-tighter dark:text-white group-hover/tool:text-white">Trip Estimator</h4>
                                </div>
                            </div>
                        </div>

                        <div
                            className="glass-card p-8 group/tool hover:bg-blue-500 transition-all duration-500 border border-blue-500/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-500/10 text-blue-500 group-hover/tool:bg-white group-hover/tool:text-blue-500 rounded-2xl transition-all">
                                    <FiTrendingUp size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/tool:text-blue-100 block italic">Performance</span>
                                    <h4 className="text-xl font-black italic tracking-tighter dark:text-white group-hover/tool:text-white">Leaderboard #1</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* --- DATA VISUALIZATION --- */}
                    <div className="md:col-span-2 mt-4">
                        <FuelCharts entries={entries} />
                    </div>
                </div>


                {/* --- RIGHT SIDEBAR (Maintenance & Activity) --- */}
                <div className="lg:col-span-4 space-y-10">
                    {/* --- MAINTENANCE HUB --- */}
                    <div className="bg-slate-900 dark:bg-neutral-950 rounded-[3.5rem] p-12 text-white shadow-3xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/20 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-10">
                                <FiSettings className="text-emerald-500 animate-spin-slow" size={20} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic opacity-50">Maintenance Status</span>
                            </div>

                            {/* PREMIUM PROGRESS CIRCLE */}
                            <div className="relative w-56 h-56 flex items-center justify-center mb-10">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="112" cy="112" r="95" fill="transparent" stroke="currentColor" strokeWidth="14" className="text-neutral-800" />
                                    <circle cx="112" cy="112" r="95" fill="transparent" stroke="#10b981" strokeWidth="14" strokeDasharray={2 * Math.PI * 95} strokeDashoffset={2 * Math.PI * 95 * (1 - maintenance.percentage / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out shadow-2xl" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black italic tracking-tighter">{maintenance.percentage}%</span>
                                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">Life Used</span>
                                </div>
                            </div>

                            <div className="text-center w-full bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 italic text-left">Oil Status: {maintenance.status}</p>
                                    <h5 className="text-lg font-black italic tracking-tight text-left">Change oil in <span className="text-emerald-500">{maintenance.remaining.toFixed(0)}</span> km</h5>
                                </div>

                                {/* MULTI-MAINTENANCE MINI BARS */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-60 italic">
                                            <span>Tire Health</span>
                                            <span>{Math.max(0, 100 - Math.round((maintenance.currentOdo - (activeVehicle?.tireLastOdo || 0)) / (activeVehicle?.tireInterval || 40000) * 100))}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.max(0, 100 - ((maintenance.currentOdo - (activeVehicle?.tireLastOdo || 0)) / (activeVehicle?.tireInterval || 40000) * 100))}%` }} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-60 italic">
                                            <span>Air Filter</span>
                                            <span>{Math.max(0, 100 - Math.round((maintenance.currentOdo - (activeVehicle?.filterLastOdo || 0)) / (activeVehicle?.filterInterval || 10000) * 100))}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${Math.max(0, 100 - ((maintenance.currentOdo - (activeVehicle?.filterLastOdo || 0)) / (activeVehicle?.filterInterval || 10000) * 100))}%` }} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-60 italic">
                                            <span>Spark Plugs</span>
                                            <span>{Math.max(0, 100 - Math.round((maintenance.currentOdo - (activeVehicle?.plugLastOdo || 0)) / (activeVehicle?.plugInterval || 20000) * 100))}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${Math.max(0, 100 - ((maintenance.currentOdo - (activeVehicle?.plugLastOdo || 0)) / (activeVehicle?.plugInterval || 20000) * 100))}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleResetMaintenance}
                                    className="w-full py-4 bg-emerald-500 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                                >
                                    Quick Reset (Oil)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- RECENT ACTIVITY --- */}
                    <div className="glass-card p-10">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block italic">Event Log</span>
                                <h3 className="text-2xl font-black italic tracking-tighter dark:text-white mt-1">Recent <span className="text-emerald-500">Activity</span></h3>
                            </div>
                            <button onClick={() => navigate("/history")} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="space-y-6">
                            {entries.slice(0, 4).map((entry, idx) => (
                                <div key={entry._id} className="flex items-center gap-4 group/item">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/item:text-emerald-500 group-hover/item:bg-emerald-500/10 transition-colors">
                                        <FiDroplet size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-black italic text-sm dark:text-white">Rs. {entry.cost.toLocaleString()}</p>
                                            <span className="text-[9px] font-bold text-slate-400">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{entry.liters}L @ {entry.odometer} km</p>
                                    </div>
                                </div>
                            ))}
                            {entries.length === 0 && (
                                <p className="text-center text-slate-500 text-xs italic py-10 font-bold uppercase tracking-widest">No entries yet...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-12 group">
                <button
                    onClick={() => navigate("/add")}
                    className="w-full py-10 bg-white/70 dark:bg-[#12141c]/70 backdrop-blur-xl shadow-2xl rounded-[3rem] border border-emerald-500/20 flex flex-col items-center justify-center gap-4 hover:bg-emerald-500 transition-all duration-500 group-hover:scale-[1.01]"
                >
                    <div className="w-20 h-20 bg-emerald-500 text-slate-900 rounded-[2rem] flex items-center justify-center group-hover:bg-white shadow-xl transition-all">
                        <FiZap size={36} />
                    </div>
                    <div>
                        <span className="text-lg font-black italic group-hover:text-white dark:text-white tracking-widest uppercase">Push Refuel Log</span>
                        <p className="text-[9px] font-black text-slate-400 group-hover:text-emerald-100 uppercase tracking-[0.5em] mt-2 italic">Initialize New Data point</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;