import React, { useState, useEffect, useMemo } from "react";
import { 
    FiAlertTriangle, FiDroplet, FiZap, FiActivity, 
    FiPlus, FiChevronDown, FiShield, FiTrendingUp, FiCheckCircle
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; 

const styles = {
    card: "bg-white/80 dark:bg-[#12141c]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-2xl rounded-[2.5rem] transition-all duration-500",
    bigNumber: "text-8xl sm:text-[10rem] font-black italic tracking-tighter leading-none text-slate-900 dark:text-white drop-shadow-2xl",
    input: "w-full bg-slate-100 dark:bg-neutral-800/80 p-5 rounded-3xl font-black text-3xl text-emerald-500 outline-none border-2 border-transparent focus:border-emerald-500/30 transition-all italic text-center",
};

const Dashboard = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(localStorage.getItem("activeVehicleId") || "");
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [manualOdoInput, setManualOdoInput] = useState("");
    const [oilStatus, setOilStatus] = useState({ percent: 0, remaining: 0, target: 0, critical: false });
    const [currentOdometer, setCurrentOdometer] = useState(0);
    const navigate = useNavigate();

    const userData = JSON.parse(localStorage.getItem("user"));
    const registeredUsername = userData ? userData.username : "Pro User";
    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        try {
            const vRes = await fetch(`${API_URL}/vehicles`, { headers: { 'Authorization': token } });
            const vData = await vRes.json();
            setVehicles(vData);

            const activeId = selectedVehicleId || vData[0]?._id;
            if (activeId) {
                setSelectedVehicleId(activeId);
                localStorage.setItem("activeVehicleId", activeId);

                const hRes = await fetch(`${API_URL}/history?vehicleId=${activeId}`, { headers: { 'Authorization': token } });
                const hData = await hRes.json();
                const sortedHistory = (Array.isArray(hData) ? hData : (hData.data || [])).sort((a, b) => new Date(b.date) - new Date(a.date));
                setEntries(sortedHistory);

                const currentVehicle = vData.find(v => v._id === activeId);
                calculateOilSystem(sortedHistory, currentVehicle);
            }
        } catch (err) { console.error("System Error:", err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [selectedVehicleId]);

    // Dashboard.jsx mein is function ko update karein
const calculateOilSystem = (history, vehicle) => {
    if (!vehicle) return;
    
    // 1. Current Reading: Latest Fuel Entry ya Manual Sync
    const latestEntryOdo = history.length > 0 ? parseFloat(history[0].odometer || 0) : 0;
    const savedOdo = localStorage.getItem(`odo_${vehicle._id}`);
    const currentOdo = Math.max(parseFloat(savedOdo || 0), latestEntryOdo);
    setCurrentOdometer(currentOdo);

    // 2. Dynamic Vehicle Stats
    // Agar Car hai tou 5000, Bike hai tou 1000, warna jo user ne set kiya wo.
    const INTERVAL = vehicle.maintenanceInterval || (vehicle.type === 'Car' ? 5000 : 1000); 
    
    const userData = JSON.parse(localStorage.getItem("user"));
    const registeredUsername = userData ? userData.username : "Pro User";
    // ⭐ NO HARDCODING: Database se pichli service ki reading uthao.
    // Agar nayi gaari hai jiski service nahi hui, tou baseline 0 hogi.
    const lastService = vehicle.oilLastOdo || 0; 
    
    // 3. Dynamic Target: Har gaari ka apna agla milestone
    const targetOdo = lastService + INTERVAL; 
    
    // 4. Calculations
    const remaining = targetOdo - currentOdo;
    const drivenInCycle = currentOdo - lastService;
    
    // Percentage use: (Driven / Interval) * 100
    const percent = Math.min((drivenInCycle / INTERVAL) * 100, 100);

    setOilStatus({
        remaining: remaining > 0 ? remaining : 0,
        percent: percent,
        target: targetOdo,
        // Critical alert: 10% interval baqi rehne par warning
        critical: remaining <= (INTERVAL * 0.1) 
    });
    
    setShowAlert(remaining <= 0);
};

    const handleSync = () => {
        if (!manualOdoInput) return;
        localStorage.setItem(`odo_${selectedVehicleId}`, manualOdoInput);
        setManualOdoInput("");
        fetchData(); 
    };

    const handleOilReset = async () => {
    const token = localStorage.getItem("token");
    
    // ⭐ Gaari ke apne interval ke mutabiq next target calculate karein
    const currentVehicle = vehicles.find(v => v._id === selectedVehicleId);
    const interval = currentVehicle?.maintenanceInterval || (currentVehicle?.type === 'Car' ? 5000 : 1000);
    const nextTarget = Math.floor(currentOdometer + interval);

    if(window.confirm(`Did you change oil at ${currentOdometer} KM? Next target will be ${nextTarget} KM`)) {
        try {
            await fetch(`${API_URL}/maintenance/reset`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ vehicleId: selectedVehicleId, currentOdo: currentOdometer })
            });
            localStorage.setItem(`odo_${selectedVehicleId}`, currentOdometer);
            fetchData();
        } catch (error) { console.error("Reset Failed"); }
    }
};

    const stats = useMemo(() => {
        const totalSpent = entries.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
        const totalLiters = entries.reduce((acc, item) => acc + (parseFloat(item.liters) || 0), 0);
        const readings = entries.map(e => parseFloat(e.odometer)).filter(v => v > 0);
        const fuelAvg = (totalLiters > 0 && readings.length > 1) 
            ? ((Math.max(...readings) - Math.min(...readings)) / totalLiters).toFixed(2) : "0.00";
        return { totalSpent, totalLiters, fuelAvg };
    }, [entries]);

    if (loading) return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-emerald-500 font-black italic text-4xl animate-pulse uppercase">Initializing System...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-500 p-4 md:p-6 max-w-300 mx-auto font-bold overflow-hidden flex flex-col justify-center">
            
            {/* COMPACT TOP BAR */}
            <div className="flex justify-between items-center mb-6">    
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"><FiShield size={20} /></div>
                    <div>
                        <p className="text-[10px] text-emerald-500 tracking-[0.2em] font-black mb-0.5 opacity-80">
                            Welcome, {registeredUsername}
                        </p>
                        <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Log<span className="text-emerald-500">.pro</span></h1>
                        <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className="bg-transparent text-[9px] uppercase font-black tracking-widest text-slate-400 outline-none cursor-pointer">
                            {vehicles.map(v => <option key={v._id} value={v._id} className="dark:bg-[#0B0E14]">{v.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">Next Milestone</p>
                    <p className="text-emerald-500 text-xl font-black italic">{oilStatus.target} KM</p>
                </div>
            </div>

            {/* HERO SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* 1. COUNTDOWN CARD (Transition from 4200 to 5200) */}
                <div className={`${styles.card} lg:col-span-8 p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><FiDroplet size={300} /></div>
                    
                    <div className="text-center md:text-left z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase mb-4 tracking-widest">
                            <FiActivity className="animate-pulse" /> Maintenance Status
                        </div>
                        <h2 className={styles.bigNumber}>{oilStatus.remaining.toFixed(0)}</h2>
                        <p className="text-sm md:text-lg text-slate-400 uppercase italic tracking-[0.3em] mt-1">KM Left to {oilStatus.target}</p>
                        <button onClick={handleOilReset} className="mt-8 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-500 transition-all active:scale-95">Complete Service</button>
                    </div>

                    <div className="relative w-52 h-52 sm:w-64 sm:h-64 shrink-0 shadow-emerald-500/20">
                        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-white/5" />
                            <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="251" strokeDashoffset={251 - (251 * oilStatus.percent) / 100} 
                                className={`${oilStatus.critical ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black dark:text-white italic">{oilStatus.percent.toFixed(0)}%</span>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Life Used</span>
                        </div>
                    </div>
                </div>

                {/* 2. SYNC & EFFICIENCY */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className={`${styles.card} p-8 flex-1 flex flex-col justify-center border-emerald-500/20 shadow-emerald-500/5`}>
                        <h3 className="text-[10px] font-black dark:text-white uppercase italic mb-4 opacity-50 flex items-center gap-2"><FiActivity /> Sync Odometer</h3>
                        <input type="number" value={manualOdoInput} onChange={(e) => setManualOdoInput(e.target.value)} placeholder={currentOdometer} className={styles.input} />
                        <button onClick={handleSync} className="w-full mt-4 bg-emerald-500 py-4 rounded-3xl text-[10px] text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30 active:scale-95 transition-all">Update Meter</button>
                    </div>

                    <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white flex justify-between items-center group relative overflow-hidden shadow-2xl shadow-emerald-500/20">
                        <FiTrendingUp className="absolute -right-4 -bottom-4 text-white/20 group-hover:scale-125 transition-transform duration-700" size={140} />
                        <div className="z-10">
                            <p className="text-[10px] font-black uppercase italic opacity-80 mb-1">Health Index</p>
                            <h2 className="text-4xl md:text-5xl font-black italic">{stats.fuelAvg} <span className="text-xs opacity-60">KM/L</span></h2>
                        </div>
                        <FiCheckCircle size={32} className="opacity-40" />
                    </div>
                </div>
            </div>

            {/* BENTO STATS - NO SCROLL GRID */}
            <div className="grid grid-cols-2 gap-6 mt-6">
                <div className={`${styles.card} p-6 flex flex-col justify-center`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase italic mb-1 tracking-widest">Total Spending</p>
                    <h2 className="text-1xl md:text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">Rs. {stats.totalSpent.toLocaleString()}</h2>
                </div>
                <div className={`${styles.card} p-6 flex flex-col justify-center`}>
                    <p className="text-[8px] font-black text-slate-400 uppercase italic mb-1 tracking-widest">Fuel Consumption</p>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">{stats.totalLiters.toFixed(1)} <span className="text-sm opacity-50">L</span></h2>
                </div>
            </div>

            
        </div>
    );
};

export default Dashboard;