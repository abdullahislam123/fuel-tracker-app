import React, { useState, useEffect, useContext } from "react";
import { FiMapPin, FiNavigation, FiZap, FiArrowLeft, FiActivity, FiMap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { VehicleContext } from "../context/VehicleContext";

const TripEstimator = () => {
    const { activeVehicle } = useContext(VehicleContext);
    const [distance, setDistance] = useState(50);
    const [fuelPrice, setFuelPrice] = useState(280);
    const [efficiency, setEfficiency] = useState(15);
    const [result, setResult] = useState({ totalCost: 0, litersNeeded: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const liters = distance / efficiency;
        const cost = liters * fuelPrice;
        setResult({
            totalCost: cost.toFixed(2),
            litersNeeded: liters.toFixed(2)
        });
    }, [distance, fuelPrice, efficiency]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0c10] pb-24 px-4 animate-fade-in">
            <header className="pt-10 mb-12 max-w-2xl mx-auto flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-4 bg-slate-100 dark:bg-neutral-900 rounded-3xl text-slate-900 dark:text-white active:scale-95 transition-all">
                    <FiArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-black italic tracking-tighter dark:text-white">Trip <span className="text-emerald-500">Estimator.</span></h1>
                <div className="w-12" />
            </header>

            <main className="max-w-2xl mx-auto space-y-8">
                {/* PREVIEW CARD */}
                <div className="glass-card p-12 bg-slate-900 dark:bg-neutral-950 text-white rounded-[3rem] relative overflow-hidden shadow-2xl shadow-emerald-500/10">
                    <div className="absolute right-0 bottom-0 opacity-10 rotate-12 translate-x-1/4 translate-y-1/4 pointer-events-none">
                        <FiNavigation size={300} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6 block italic">Projected Expenditure</span>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black italic text-emerald-500">Rs.</span>
                        <h2 className="text-7xl md:text-8xl font-black tracking-tighter italic">{result.totalCost}</h2>
                    </div>
                    <div className="mt-8 flex items-center gap-6 text-slate-400">
                        <div className="flex items-center gap-2">
                            <FiZap className="text-blue-500" />
                            <span className="text-sm font-black italic">{result.litersNeeded} Liters Required</span>
                        </div>
                    </div>
                </div>

                {/* INPUTS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-8 space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">Trip Distance (KM)</label>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><FiMapPin size={20} /></div>
                            <input
                                type="number"
                                value={distance}
                                onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                                className="bg-transparent text-3xl font-black italic outline-none dark:text-white w-full"
                            />
                        </div>
                    </div>

                    <div className="glass-card p-8 space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">Fuel Price (Rs./L)</label>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><FiActivity size={20} /></div>
                            <input
                                type="number"
                                value={fuelPrice}
                                onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                                className="bg-transparent text-3xl font-black italic outline-none dark:text-white w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-10 space-y-6">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic block">Efficiency (KM/L)</label>
                        <span className="text-emerald-500 font-black italic">{efficiency} KM/L</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="60"
                        step="0.5"
                        value={efficiency}
                        onChange={(e) => setEfficiency(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-2 bg-slate-100 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
                    />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter italic">
                        Adjust based on your vehicle's performance or terrain conditions.
                    </p>
                </div>

                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] flex items-center gap-6 group hover:bg-emerald-500/5 transition-all">
                    <div className="p-5 bg-emerald-500 rounded-2xl text-slate-900 shadow-xl group-hover:rotate-12 transition-transform">
                        <FiMap size={24} />
                    </div>
                    <div>
                        <h4 className="font-black italic text-slate-900 dark:text-white uppercase tracking-wider">Ready to Navigate?</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Open Maps to find the best route for this trip.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TripEstimator;
