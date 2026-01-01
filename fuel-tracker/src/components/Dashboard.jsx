import React, { useState, useEffect, useMemo } from "react";
import { FiAlertTriangle, FiDroplet, FiZap, FiActivity, FiTrendingUp, FiSettings, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; 

// --- STYLES & ANIMATIONS ---
const styles = {
    card: "bg-white dark:bg-neutral-900/40 backdrop-blur-2xl border border-slate-200 dark:border-white/5 shadow-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-emerald-500/5",
    input: "w-full bg-slate-100 dark:bg-neutral-800/50 p-6 rounded-3xl font-black text-4xl text-emerald-500 outline-none border-2 border-transparent focus:border-emerald-500/30 transition-all italic",
    buttonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50",
    buttonSecondary: "bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-[0.2em] active:scale-95 transition-all"
};

const DashboardSkeleton = () => (
    <div className="animate-pulse pb-32 px-4 md:px-10 lg:px-16 max-w-7xl mx-auto pt-8 space-y-12">
        <div className="h-16 bg-gray-200 dark:bg-neutral-800 w-64 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-112.5 bg-gray-200 dark:bg-neutral-800 rounded-[4rem]"></div>
            <div className="h-112.5 bg-gray-200 dark:bg-neutral-800 rounded-[4rem]"></div>
        </div>
    </div>
);

const Dashboard = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [manualOdoInput, setManualOdoInput] = useState("");
    const [oilStatus, setOilStatus] = useState({ percent: 0, remaining: 0, target: 0, critical: false });
    const [currentOdometer, setCurrentOdometer] = useState(0);
    const navigate = useNavigate();

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

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
            setTimeout(() => setLoading(false), 800);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const calculateOilSystem = (history, dbMaint) => {
        const savedOdo = localStorage.getItem("manualOdo");
        const latestEntryOdo = history.length > 0 ? Math.max(...history.map(e => parseFloat(e.odometer || 0))) : 0;
        const currentOdo = savedOdo ? parseFloat(savedOdo) : (latestEntryOdo || 4800);
        setCurrentOdometer(currentOdo);

        const INTERVAL = 1000; // Standard for 70cc bikes
        let lastService = dbMaint?.oil_last_odo || parseFloat(localStorage.getItem(`last_oil_odo`)) || 0;
        
        if(lastService === 0 && currentOdo > 0) lastService = 4000; 

        const targetOdo = lastService + INTERVAL;
        const remaining = targetOdo - currentOdo;
        const drivenSinceLast = currentOdo - lastService;
        const percent = Math.min((drivenSinceLast / INTERVAL) * 100, 100);

        setOilStatus({
            remaining: remaining > 0 ? remaining : 0,
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
                fetchData();
                setShowAlert(false);
            }
        } catch (error) {
            localStorage.setItem(`last_oil_odo`, currentOdometer);
            fetchData();
        }
    };

    const handleManualUpdate = () => {
        if (!manualOdoInput) return;
        localStorage.setItem("manualOdo", manualOdoInput);
        fetchData();
        setManualOdoInput("");
    };

    const stats = useMemo(() => {
        const totalSpent = entries.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
        const totalLiters = entries.reduce((acc, item) => acc + (parseFloat(item.liters) || 0), 0);
        const readings = entries.map(e => parseFloat(e.odometer)).filter(v => v > 0);
        const fuelAvg = (totalLiters > 0 && readings.length > 1) 
            ? ((Math.max(...readings) - Math.min(...readings)) / totalLiters).toFixed(2) : "0.00";
        return { totalSpent, totalLiters, fuelAvg };
    }, [entries]);

    if (loading) return <div className="min-h-screen bg-white dark:bg-neutral-950"><DashboardSkeleton /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 transition-colors duration-500 pb-32 px-4 md:px-10 lg:px-16 max-w-7xl mx-auto font-bold">
            
            {/* ALERT TOAST */}
            {showAlert && (
                <div className="fixed inset-x-4 top-6 z-100 md:max-w-md md:mx-auto animate-bounce">
                    <div className="bg-red-600 text-white p-5 rounded-4xl shadow-2xl flex items-center gap-4 border-2 border-white/20">
                        <FiAlertTriangle size={28} />
                        <div className="flex-1">
                            <h4 className="text-[10px] uppercase font-black tracking-widest">Service Required</h4>
                            <p className="text-xs opacity-90">Oil change interval exceeded!</p>
                        </div>
                        <button onClick={handleOilReset} className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Fix Now</button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header className="mb-12 pt-12 flex justify-between items-end">
                <div>
                    <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">
                        FuelTracker<span className="text-emerald-500">.pro</span>
                    </h1>
                    <p className="text-slate-400 dark:text-neutral-500 text-xs mt-4 tracking-[0.4em] uppercase italic">Automotive Intelligence System</p>
                </div>
                <button onClick={() => navigate('/add')} className="hidden md:flex items-center gap-2 bg-emerald-500 text-white p-4 rounded-full hover:rotate-90 transition-all duration-500">
                    <FiPlus size={24} />
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* MAIN OIL STATUS CARD */}
                <div className={`${styles.card} lg:col-span-2 p-10 md:p-14 rounded-[4.5rem] relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6">
                                <FiDroplet /> {oilStatus.critical ? "Critical Status" : "Lubrication Optimal"}
                            </div>
                            <h2 className="text-9xl md:text-[11rem] font-black text-slate-900 dark:text-white italic tracking-tighter leading-none mb-2">
                                {oilStatus.remaining.toFixed(0)}
                            </h2>
                            <p className="text-2xl text-slate-400 uppercase italic">Kilometers left</p>
                            <button onClick={handleOilReset} className={`${styles.buttonPrimary} mt-10 px-12 py-5 rounded-3xl text-[11px]`}>Reset Service Cycle</button>
                        </div>

                        {/* PROGRESS CIRCLE */}
                        <div className="relative w-56 h-56 md:w-72 md:h-72">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="20" className="text-slate-100 dark:text-neutral-800" />
                                <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="20" strokeDasharray="283" strokeDashoffset={283 - (283 * oilStatus.percent) / 100} 
                                    className={`${oilStatus.critical ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-slate-900 dark:text-white">{oilStatus.percent.toFixed(0)}%</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Used</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ODOMETER SYNC CARD */}
                <div className={`${styles.card} p-10 rounded-[4.5rem] flex flex-col justify-between group`}>
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <FiActivity className="text-emerald-500" size={24} />
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">Sync Odometer</h3>
                        </div>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={manualOdoInput} 
                                onChange={(e) => setManualOdoInput(e.target.value)} 
                                placeholder={currentOdometer} 
                                className={styles.input} 
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-neutral-600 font-black italic">KM</span>
                        </div>
                    </div>
                    <button onClick={handleManualUpdate} className={`${styles.buttonSecondary} w-full mt-8 py-6 rounded-3xl text-[12px]`}>Push to Cloud</button>
                </div>
            </div>

            {/* BENTO STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-emerald-500 p-10 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <FiTrendingUp className="absolute -right-8 -bottom-8 text-white/10" size={200} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-4 italic">Fuel Efficiency</p>
                    <h2 className="text-6xl font-black italic tracking-tighter leading-none">{stats.fuelAvg} <span className="text-xl opacity-60">KM/L</span></h2>
                </div>

                <div className={`${styles.card} p-10 rounded-[4rem] flex flex-col justify-center`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic">Total Investment</p>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">
                        <span className="text-lg text-emerald-500 mr-2">PKR</span>
                        {stats.totalSpent.toLocaleString()}
                    </h2>
                </div>

                <div className={`${styles.card} p-10 rounded-[4rem] flex flex-col justify-center`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic">Fuel Consumed</p>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">
                        {stats.totalLiters.toFixed(1)} <span className="text-lg text-emerald-500">Liters</span>
                    </h2>
                </div>
            </div>

            {/* FLOATING ACTION BUTTON (Mobile) */}
            <button onClick={() => navigate('/add')} className="md:hidden fixed bottom-10 right-10 z-50 bg-emerald-500 text-white w-20 h-20 rounded-full shadow-[0_20px_50px_rgba(16,185,129,0.4)] flex items-center justify-center active:scale-90 transition-all">
                <FiPlus size={32} />
            </button>
        </div>
    );
};

export default Dashboard;