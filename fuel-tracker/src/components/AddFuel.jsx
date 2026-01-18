import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiDroplet, FiDollarSign, FiActivity, FiArrowLeft, 
  FiSave, FiZap, FiInfo, FiCheckCircle, FiChevronDown, FiSettings
} from "react-icons/fi";
import { API_URL } from "../config"; 
import { VehicleContext } from "../App"; // Global state integration

const styles = {
    card: "bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/5 shadow-2xl rounded-[3rem] p-6 md:p-10",
    inputGroup: "relative mb-4",
    label: "text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-1 block",
    input: "w-full bg-slate-100 dark:bg-neutral-800/60 p-4 rounded-2xl font-black text-xl text-emerald-500 outline-none border-2 border-transparent focus:border-emerald-500/30 transition-all italic pl-12",
    icon: "absolute left-4 top-[65%] -translate-y-1/2 text-slate-400"
};

const AddFuel = () => {
    const navigate = useNavigate();
    const { activeVehicle } = useContext(VehicleContext);
    const [vehicles, setVehicles] = useState([]);
    const [lastReading, setLastReading] = useState(0);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        vehicleId: activeVehicle?._id || localStorage.getItem("activeVehicleId") || "",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        cost: "", 
        liters: "", 
        pricePerLiter: "", 
        odometer: "" 
    });

    // ⭐ STEP 1: Sync Vehicles & Last Reading
    useEffect(() => {
        const token = localStorage.getItem("token");
        
        fetch(`${API_URL}/vehicles`, { headers: { 'Authorization': token } })
            .then(res => res.json())
            .then(vData => setVehicles(vData));

        if (formData.vehicleId) {
            fetch(`${API_URL}/history?vehicleId=${formData.vehicleId}`, { 
                headers: { 'Authorization': token } 
            })
            .then(res => res.json())
            .then(data => {
                const dataArray = Array.isArray(data) ? data : [];
                if (dataArray.length > 0) {
                    const maxOdo = Math.max(...dataArray.map(e => parseFloat(e.odometer || 0)));
                    setLastReading(maxOdo);
                } else {
                    setLastReading(0);
                }
            });
        }
    }, [formData.vehicleId]);

    // Auto-calculate Total Cost
    useEffect(() => {
        const l = parseFloat(formData.liters || 0);
        const p = parseFloat(formData.pricePerLiter || 0);
        setFormData(prev => ({ ...prev, cost: (l * p).toFixed(2) }));
    }, [formData.liters, formData.pricePerLiter]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (parseFloat(formData.odometer) <= lastReading) {
            alert(`Error: Odometer must be higher than ${lastReading} KM!`);
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token"); 
        try {
            const response = await fetch(`${API_URL}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // ⭐ Update Local Storage so Dashboard decreases KM instantly
                localStorage.setItem(`odo_${formData.vehicleId}`, formData.odometer);
                navigate("/dashboard");
            }
        } catch (error) { 
            alert("Save failed!"); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0E14] p-4 flex flex-col items-center justify-center font-bold overflow-hidden">
            <div className="w-full max-w-lg animate-fade-in">
                
                {/* Compact Header */}
                <header className="flex items-center justify-between mb-6 px-2">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-[#12141c] rounded-xl shadow-md dark:text-white active:scale-90 transition-all">
                        <FiArrowLeft size={20} />
                    </button>
                    <div className="text-right">
                        <h2 className="text-xl font-black italic dark:text-white uppercase leading-none">New <span className="text-emerald-500">Entry</span></h2>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1">Recalibrating Cycle...</p>
                    </div>
                </header>

                <form onSubmit={handleSave} className={styles.card}>
                    
                    {/* Vehicle Selector */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Selected Ride</label>
                        <FiSettings className={styles.icon} />
                        <select 
                            value={formData.vehicleId} 
                            onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                            className={styles.input + " appearance-none cursor-pointer"}
                        >
                            {vehicles.map(v => <option key={v._id} value={v._id} className="dark:bg-[#12141c]">{v.name}</option>)}
                        </select>
                        <FiChevronDown className="absolute right-4 top-[65%] -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* ⭐ Odometer (Primary for countdown tracking) */}
                    <div className="bg-emerald-500/5 p-5 rounded-4xl border border-dashed border-emerald-500/20 mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><FiActivity /> Odometer (KM)</label>
                            {lastReading > 0 && <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Last: {lastReading}</span>}
                        </div>
                        <div className="relative">
                            <FiZap className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" />
                            <input 
                                required type="number" step="0.1"
                                className="w-full p-4 pl-12 bg-white dark:bg-neutral-800 rounded-2xl font-black text-2xl text-slate-900 dark:text-white outline-none border-2 border-transparent focus:border-emerald-500 italic shadow-sm"
                                value={formData.odometer}
                                onChange={(e) => setFormData({...formData, odometer: e.target.value})}
                                placeholder="0.0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Liters</label>
                            <FiDroplet className={styles.icon} />
                            <input 
                                required type="number" step="0.01" 
                                className={styles.input} 
                                value={formData.liters}
                                onChange={(e) => setFormData({...formData, liters: e.target.value})}
                                placeholder="5.0"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Price/L</label>
                            <FiDollarSign className={styles.icon} />
                            <input 
                                required type="number" step="0.01" 
                                className={styles.input} 
                                value={formData.pricePerLiter}
                                onChange={(e) => setFormData({...formData, pricePerLiter: e.target.value})}
                                placeholder="267"
                            />
                        </div>
                    </div>

                    {/* Total Display */}
                    <div className="bg-slate-900 p-6 rounded-4xl flex items-center justify-between mt-2 shadow-inner">
                         <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-emerald-500" size={20} />
                            <span className="text-sm font-black text-white italic uppercase tracking-tighter">Total Bill</span>
                         </div>
                         <div className="text-2xl font-black text-emerald-500 tracking-tighter">Rs. {formData.cost}</div>
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full mt-6 py-5 bg-emerald-500 text-white rounded-4xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                    >
                        {loading ? "SYNCING..." : <><FiSave size={18} /> Update Logs & Countdown</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddFuel;