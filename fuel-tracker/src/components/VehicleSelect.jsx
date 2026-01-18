import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiCheckCircle, FiSettings, FiTruck, FiEdit3, FiZap, FiX } from "react-icons/fi";
import { VehicleContext } from "../App";
import { API_URL } from "../config";

const styles = {
    card: "bg-white dark:bg-neutral-900 p-8 rounded-[3rem] border-4 border-transparent hover:border-emerald-500 cursor-pointer transition-all text-center shadow-xl group relative overflow-hidden",
    input: "w-full bg-slate-100 dark:bg-neutral-800/50 p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 dark:text-white transition-all mb-4",
    label: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block ml-2"
};

const VehicleSelect = () => {
    const [vehicles, setVehicles] = useState([]);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customData, setCustomData] = useState({ name: "", type: "Custom", interval: 1000 });
    const { setActiveVehicle } = useContext(VehicleContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/vehicles`, { headers: { 'Authorization': token } });
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
    };

    const handleSaveVehicle = async (e, typeOverride = null) => {
        const token = localStorage.getItem("token");
        const payload = typeOverride 
            ? { name: `My ${typeOverride}`, type: typeOverride, maintenanceInterval: typeOverride === 'Bike' ? 1000 : 5000 }
            : { name: customData.name, type: customData.type, maintenanceInterval: customData.interval };

        try {
            const res = await fetch(`${API_URL}/vehicles/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                selectAndProceed(data.vehicle);
            }
        } catch (err) {
            alert("Error adding vehicle");
        }
    };

    const selectAndProceed = (vehicle) => {
        localStorage.setItem("activeVehicleId", vehicle._id);
        localStorage.setItem("activeVehicleName", vehicle.name);
        setActiveVehicle(vehicle);
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6 flex flex-col items-center justify-center font-bold">
            
            {/* Header */}
            <header className="text-center mb-12">
                <h1 className="text-5xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">
                    The <span className="text-emerald-500">Garage</span>
                </h1>
                <p className="text-slate-400 text-[10px] font-black mt-2 tracking-[0.3em] uppercase">Select or create your ride</p>
            </header>

            {/* Quick Select Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
                <div onClick={() => handleSaveVehicle(null, 'Bike')} className={styles.card}>
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏍️</div>
                    <h3 className="text-xl font-black uppercase italic dark:text-white">Bike</h3>
                    <p className="text-[10px] text-emerald-500 font-black mt-2 tracking-widest uppercase">1,000 KM Cycle</p>
                </div>

                <div onClick={() => handleSaveVehicle(null, 'Car')} className={styles.card}>
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🚗</div>
                    <h3 className="text-xl font-black uppercase italic dark:text-white">Car</h3>
                    <p className="text-[10px] text-emerald-500 font-black mt-2 tracking-widest uppercase">5,000 KM Cycle</p>
                </div>
            </div>

            {/* Existing Vehicles List */}
            {vehicles.length > 0 && (
                <div className="w-full max-w-2xl mb-10">
                    <p className="text-center text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest italic">Registered Assets</p>
                    <div className="space-y-4">
                        {vehicles.map(v => (
                            <div key={v._id} onClick={() => selectAndProceed(v)} className="bg-white dark:bg-neutral-900 p-6 rounded-4xl flex items-center justify-between group cursor-pointer hover:bg-emerald-500 transition-all border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-white/20">
                                        {v.type === 'Bike' ? '🏍️' : (v.type === 'Car' ? '🚗' : '⚙️')}
                                    </div>
                                    <div>
                                        <h4 className="font-black italic uppercase dark:text-white group-hover:text-white">{v.name}</h4>
                                        <p className="text-[9px] font-black text-slate-400 group-hover:text-white/70 uppercase">{v.type} Mode</p>
                                    </div>
                                </div>
                                <FiCheckCircle className="text-emerald-500 group-hover:text-white" size={20} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Type Button */}
            {!showCustomModal && (
                <button 
                    onClick={() => setShowCustomModal(true)}
                    className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-[2.5rem] font-black uppercase italic tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all"
                >
                    <FiPlus /> Create Your Own Type
                </button>
            )}

            {/* ⭐ CUSTOM TYPE ENHANCED FORM */}
            {showCustomModal && (
                <div className="w-full max-w-xl bg-white dark:bg-neutral-900 p-10 rounded-[3.5rem] shadow-2xl border-4 border-emerald-500/20 animate-slide-up relative">
                    <button onClick={() => setShowCustomModal(false)} className="absolute right-8 top-8 text-slate-400 hover:text-red-500 transition-colors"><FiX size={24} /></button>
                    
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-500 rounded-2xl text-white"><FiTruck size={24} /></div>
                        <h2 className="text-2xl font-black italic uppercase dark:text-white">Custom Asset</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className={styles.label}>Nickname</label>
                            <div className="relative">
                                <FiEdit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input className={styles.input + " pl-12"} placeholder="e.g. My Rickshaw" onChange={e => setCustomData({...customData, name: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={styles.label}>Type</label>
                                <input className={styles.input} placeholder="Rickshaw" onChange={e => setCustomData({...customData, type: e.target.value})} />
                            </div>
                            <div>
                                <label className={styles.label}>Gap (KM)</label>
                                <div className="relative">
                                    <FiZap className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    <input type="number" className={styles.input + " pl-12"} placeholder="1000" onChange={e => setCustomData({...customData, interval: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveVehicle}
                            className="w-full bg-emerald-500 text-white py-6 rounded-3xl font-black uppercase italic tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            Deploy to Garage
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleSelect;