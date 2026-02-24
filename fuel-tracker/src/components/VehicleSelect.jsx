import React, { useState, useEffect, useContext } from "react";
import { FiPlus, FiTruck, FiSettings, FiCheck, FiCpu, FiPlusCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { VehicleContext } from "../context/VehicleContext";

const VehicleSelect = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setActiveVehicle } = useContext(VehicleContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVehicles = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${API_URL}/vehicles`, {
                    headers: { 'Authorization': token }
                });
                const data = await res.json();
                setVehicles(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchVehicles();
    }, []);

    const handleSelect = (vehicle) => {
        setActiveVehicle(vehicle);
        localStorage.setItem("activeVehicleId", vehicle._id);
        navigate("/dashboard");
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0c10]">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Scanning Fleet...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0c10] px-4 pb-20 animate-fade-in">
            <header className="pt-16 mb-16 text-center">
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none mb-4">
                    My Garage<span className="text-emerald-500">.</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Operational Units Selection</p>
            </header>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {vehicles.map(v => (
                    <div
                        key={v._id}
                        onClick={() => handleSelect(v)}
                        className="glass-card p-10 group cursor-pointer hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 relative overflow-hidden"
                    >
                        <div className="absolute right-0 top-0 p-8 text-emerald-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                            <FiCpu size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-5 bg-emerald-500/10 text-emerald-500 rounded-3xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                    {v.type === 'Bike' ? <FiTruck size={28} /> : <FiSettings size={28} />}
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">{v.type} Unit</span>
                                    <h3 className="text-2xl font-black dark:text-white italic tracking-tight">{v.name}</h3>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-emerald-500 transition-colors">Select Module</span>
                                <FiCheck size={24} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0" />
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => navigate("/add-vehicle")}
                    className="glass-card p-10 border-dashed border-2 flex flex-col items-center justify-center gap-4 group hover:bg-emerald-500 transition-all duration-500 min-h-[250px]"
                >
                    <div className="p-6 bg-slate-100 dark:bg-neutral-900 rounded-full text-slate-400 group-hover:bg-white group-hover:text-emerald-500 transition-all">
                        <FiPlus size={32} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic group-hover:text-white">Register New Unit</span>
                </button>
            </div>
        </div>
    );
};

export default VehicleSelect;