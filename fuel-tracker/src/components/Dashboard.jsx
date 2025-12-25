import React, { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiDollarSign, FiDroplet, FiTrendingUp, FiAlertTriangle, FiActivity, FiZap, FiEdit3, FiSettings, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; 

const Dashboard = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [manualOdoInput, setManualOdoInput] = useState("");
    const navigate = useNavigate();

    const [oilStatus, setOilStatus] = useState({});
    const [currentOdometer, setCurrentOdometer] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const fetchData = async () => {
            try {
                const hRes = await fetch(`${API_URL}/history`, { headers: { 'Authorization': token } });
                const hData = await hRes.json();
                const sortedHistory = (Array.isArray(hData) ? hData : (hData.data || [])).sort((a, b) => new Date(a.date) - new Date(b.date));
                setEntries(sortedHistory);

                let maintData = null;
                try {
                    const mRes = await fetch(`${API_URL}/maintenance`, { headers: { 'Authorization': token } });
                    if (mRes.ok) maintData = await mRes.json();
                } catch (e) { console.warn("Sync Offline"); }
                
                calculateOilSystem(sortedHistory, maintData);
            } catch (err) {
                console.error("Dashboard Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const calculateOilSystem = (history, dbMaint) => {
        const savedOdo = localStorage.getItem("manualOdo");
        const latestEntryOdo = history.length > 0 ? Math.max(...history.map(e => parseFloat(e.odometer || 0))) : 0;
        
        // ⭐ CURRENT READING (e.g. 4873.8)
        const currentOdo = savedOdo ? parseFloat(savedOdo) : (latestEntryOdo || 4873.8);
        setCurrentOdometer(currentOdo);

        const INTERVAL = 1000;
        let lastService = dbMaint?.oil_last_odo || parseFloat(localStorage.getItem(`last_oil_odo`)) || 0;
        
        // ⭐ SMART LOGIC: Agar record 0 hai aur hum 4873 par hain, toh baseline 4200 set karein taake target 5200 bane
        if(lastService === 0 && currentOdo > 0) {
            lastService = 4200; 
        }

        const targetOdo = lastService + INTERVAL;
        const remaining = targetOdo - currentOdo;
        const drivenSinceLast = currentOdo - lastService;
        const percent = Math.min((drivenSinceLast / INTERVAL) * 100, 100);

        const status = {
            remaining: remaining > 0 ? remaining.toFixed(1) : 0,
            percent: percent,
            target: targetOdo,
            critical: remaining <= 0
        };

        setOilStatus(status);
        if (status.critical) setShowAlert(true);
    };

    const handleOilReset = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/maintenance/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ oil_last_odo: currentOdometer })
            });
            if (res.ok) {
                localStorage.setItem(`last_oil_odo`, currentOdometer);
                alert(`Oil reset at ${currentOdometer} KM! Next target is ${parseFloat(currentOdometer) + 1000} KM.`);
                window.location.reload();
            }
        } catch (error) {
            localStorage.setItem(`last_oil_odo`, currentOdometer);
            window.location.reload();
        }
    };

    const handleManualUpdate = () => {
        if (!manualOdoInput) return;
        localStorage.setItem("manualOdo", manualOdoInput);
        window.location.reload();
    };

    const stats = useMemo(() => {
        const totalSpent = entries.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
        const totalLiters = entries.reduce((acc, item) => acc + (parseFloat(item.liters) || 0), 0);
        const readings = entries.map(e => parseFloat(e.odometer)).filter(v => v > 0);
        const fuelAvg = (totalLiters > 0 && readings.length > 1) 
            ? ((Math.max(...readings) - Math.min(...readings)) / totalLiters).toFixed(2) : "0.00";
        return { totalSpent, totalLiters, fuelAvg };
    }, [entries]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-black animate-pulse">SYNCING ENGINE DATA...</div>;

    return (
        <div className="animate-fade-in pb-32 px-4 md:px-10 lg:px-16 max-w-7xl mx-auto italic font-bold">
            
            {/* ALERT OVERLAY */}
            {showAlert && (
                <div className="fixed inset-x-4 top-4 z-100 md:max-w-md md:mx-auto animate-bounce bg-red-600 text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 border-2 border-white/10">
                    <FiAlertTriangle size={32} />
                    <div className="flex-1">
                        <h4 className="text-[10px] uppercase font-black">Oil Change Overdue</h4>
                        <button onClick={handleOilReset} className="mt-2 bg-white text-red-600 px-4 py-1 rounded-lg text-[10px] uppercase font-black shadow-lg">Confirm Service</button>
                    </div>
                </div>
            )}

            <header className="mb-12 pt-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">FuelTracker<span className="text-emerald-500">.pro</span></h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Precision Performance Monitoring</p>
                </div>
                <div className="hidden md:flex bg-emerald-500/10 px-6 py-2.5 rounded-full text-emerald-500 text-[10px] border border-emerald-500/20 uppercase tracking-widest items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live Cloud Active
                </div>
            </header>

            {/* --- HERO SECTION: ENGINE OIL CARD --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-slate-900 p-10 md:p-14 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="text-center md:text-left flex-1">
                            <p className="text-emerald-500 text-xs font-black uppercase tracking-[0.3em] mb-4 italic">Oil Life Status</p>
                            <h2 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter leading-none">{oilStatus.remaining}</h2>
                            <p className="text-2xl text-slate-400 mt-2 uppercase">KM Remaining</p>
                            <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                                    <p className="text-[9px] text-slate-500 uppercase">Next Goal</p>
                                    <p className="text-lg text-white font-black">{oilStatus.target} KM</p>
                                </div>
                                <button onClick={handleOilReset} className="bg-emerald-500 text-white px-10 py-4 rounded-4xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">Reset Cycle</button>
                            </div>
                        </div>
                        
                        {/* Progressive Ring */}
                        <div className="relative w-48 h-48 md:w-60 md:h-60 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-800" />
                                <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="283" strokeDashoffset={283 - (283 * oilStatus.percent) / 100} className={`${oilStatus.critical ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-4xl text-white font-black">{oilStatus.percent.toFixed(0)}%</span>
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Utilized</span>
                            </div>
                        </div>
                    </div>
                    <FiDroplet className="absolute -right-10 -bottom-10 text-emerald-500 opacity-5" size={300} />
                </div>

                {/* 📝 ODOMETER UPDATE SECTION (Now side-by-side on laptop) */}
                <div className="bg-white dark:bg-neutral-900 p-10 rounded-[4rem] border dark:border-neutral-800 shadow-xl flex flex-col justify-between group">
                    <div>
                        <div className="bg-emerald-500/10 p-4 rounded-3xl text-emerald-500 w-fit mb-6"><FiEdit3 size={24}/></div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">System Pulse</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Update tonight's reading</p>
                        <input 
                            type="number" 
                            value={manualOdoInput} 
                            onChange={(e) => setManualOdoInput(e.target.value)} 
                            placeholder={currentOdometer} 
                            className="w-full mt-10 p-6 bg-slate-50 dark:bg-neutral-800/50 border-none rounded-3xl outline-none font-black text-slate-900 dark:text-white text-4xl italic placeholder:opacity-20" 
                        />
                    </div>
                    <button onClick={handleManualUpdate} className="w-full mt-8 bg-slate-900 dark:bg-emerald-600 text-white py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:opacity-90 transition-all active:scale-95 shadow-lg">Sync Reading</button>
                </div>
            </div>

            {/* --- ANALYTICS SECTION --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-emerald-500 p-10 rounded-[3.5rem] shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden group">
                    <FiZap className="absolute -right-8 -bottom-8 text-white/20 group-hover:scale-110 transition-transform duration-1000" size={180} />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Fuel Efficiency</p>
                    <h2 className="text-5xl font-black italic tracking-tighter leading-none">{stats.fuelAvg} <span className="text-xl font-bold">KM/L</span></h2>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-10 rounded-[3.5rem] border dark:border-neutral-800 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Total Expenditure</p>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">Rs. {stats.totalSpent.toLocaleString()}</h2>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-10 rounded-[3.5rem] border dark:border-neutral-800 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Volume Consumed</p>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{stats.totalLiters.toFixed(1)} <span className="text-xl opacity-40 uppercase">Liters</span></h2>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;