import React, { useState, useEffect, useMemo } from "react";
import { FiAlertTriangle, FiDroplet, FiZap, FiEdit3, FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; 

// --- PROFESSIONAL SKELETON UI (Only UI, No Logic Change) ---
const DashboardSkeleton = () => (
  <div className="animate-pulse pb-32 px-4 md:px-10 lg:px-16 max-w-7xl mx-auto italic pt-8 space-y-12">
    <div className="h-16 bg-gray-200 dark:bg-neutral-800 w-64 rounded-2xl"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-neutral-900 rounded-[4rem]"></div>
      <div className="h-96 bg-gray-200 dark:bg-neutral-900 rounded-[4rem]"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-44 bg-gray-200 dark:bg-neutral-800 rounded-[3.5rem]"></div>
      <div className="h-44 bg-gray-200 dark:bg-neutral-800 rounded-[3.5rem]"></div>
      <div className="h-44 bg-gray-200 dark:bg-neutral-800 rounded-[3.5rem]"></div>
    </div>
  </div>
);

const Dashboard = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [manualOdoInput, setManualOdoInput] = useState("");
    const [oilStatus, setOilStatus] = useState({ percent: 0, remaining: 0, target: 0 });
    const [currentOdometer, setCurrentOdometer] = useState(0);
    const navigate = useNavigate();

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
        
        // Restore original currentOdo logic
        const currentOdo = savedOdo ? parseFloat(savedOdo) : (latestEntryOdo || 4873.8);
        setCurrentOdometer(currentOdo);

        const INTERVAL = 1000;
        let lastService = dbMaint?.oil_last_odo || parseFloat(localStorage.getItem(`last_oil_odo`)) || 0;
        
        // ⭐ RESTORED ORIGINAL BASELINE LOGIC (Fix for 800km issue)
        if(lastService === 0 && currentOdo > 0) {
            lastService = 4200; 
        }

        const targetOdo = lastService + INTERVAL;
        const remaining = targetOdo - currentOdo;
        const drivenSinceLast = currentOdo - lastService;
        const percent = Math.min((drivenSinceLast / INTERVAL) * 100, 100);

        setOilStatus({
            remaining: remaining > 0 ? remaining.toFixed(1) : 0,
            percent: percent,
            target: targetOdo,
            critical: remaining <= 0
        });

        if (remaining <= 0) setShowAlert(true);
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
                alert(`Oil reset at ${currentOdometer} KM!`);
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

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="animate-in fade-in duration-700 pb-32 px-4 md:px-10 lg:px-16 max-w-7xl mx-auto italic font-bold">
            {/* ALERT OVERLAY */}
            {showAlert && (
                <div className="fixed inset-x-4 top-4 z-100 md:max-w-md md:mx-auto bg-red-600 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4 border-2 border-white/20">
                    <FiAlertTriangle size={32} />
                    <div className="flex-1">
                        <h4 className="text-xs uppercase font-black tracking-tight">Oil Change Required</h4>
                        <button onClick={handleOilReset} className="mt-2 bg-white text-red-600 px-4 py-1 rounded-lg text-[10px] uppercase font-black">Confirm Reset</button>
                    </div>
                </div>
            )}

            <header className="mb-12 pt-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">FuelTracker<span className="text-emerald-500">.pro</span></h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Precision Performance Monitoring</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* ENGINE OIL CARD */}
                <div className="lg:col-span-2 bg-slate-900 p-10 md:p-14 rounded-[4.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="text-center md:text-left flex-1">
                            <p className="text-emerald-500 text-xs font-black uppercase tracking-[0.3em] mb-4 italic">Oil Life Status</p>
                            <h2 className="text-8xl md:text-9xl font-black text-white italic tracking-tighter leading-none">{oilStatus.remaining}</h2>
                            <p className="text-2xl text-slate-400 mt-2 uppercase">KM Remaining</p>
                            <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                                <button onClick={handleOilReset} className="bg-emerald-500 text-white px-10 py-4 rounded-4xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">Reset Cycle</button>
                            </div>
                        </div>
                        
                        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="14" className="text-slate-800" />
                                <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="14" strokeDasharray="283" strokeDashoffset={283 - (283 * oilStatus.percent) / 100} className={`${oilStatus.critical ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-5xl text-white font-black">{oilStatus.percent.toFixed(0)}%</span>
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Utilized</span>
                            </div>
                        </div>
                    </div>
                    <FiDroplet className="absolute -right-10 -bottom-10 text-emerald-500 opacity-5" size={300} />
                </div>

                {/* ODOMETER INPUT CARD */}
                <div className="bg-white dark:bg-neutral-900 p-10 rounded-[4.5rem] border dark:border-neutral-800 shadow-xl flex flex-col justify-between group">
                    <div>
                        <div className="bg-emerald-500/10 p-4 rounded-3xl text-emerald-500 w-fit mb-6"><FiEdit3 size={24}/></div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Sync Odometer</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Current: {currentOdometer} KM</p>
                        <input 
                            type="number" 
                            value={manualOdoInput} 
                            onChange={(e) => setManualOdoInput(e.target.value)} 
                            placeholder="Enter KM" 
                            className="w-full mt-10 p-6 bg-slate-50 dark:bg-neutral-800 border-none rounded-3xl outline-none font-black text-slate-900 dark:text-white text-5xl italic placeholder:opacity-10" 
                        />
                    </div>
                    <button onClick={handleManualUpdate} className="w-full mt-8 bg-slate-900 dark:bg-emerald-600 text-white py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:opacity-90 active:scale-95 transition-all">Push Update</button>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-emerald-500 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
                    <FiZap className="absolute -right-8 -bottom-8 text-white/20" size={180} />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Efficiency</p>
                    <h2 className="text-5xl font-black italic tracking-tighter leading-none">{stats.fuelAvg} <span className="text-xl">KM/L</span></h2>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-10 rounded-[3.5rem] border dark:border-neutral-800 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Total Spent</p>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">Rs. {stats.totalSpent.toLocaleString()}</h2>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-10 rounded-[3.5rem] border dark:border-neutral-800 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Volume</p>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{stats.totalLiters.toFixed(1)} L</h2>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;